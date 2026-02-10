'use client';

import { useCallback, useEffect, useRef } from 'react';
import { PROGRESS_SAVE_CONFIG } from '../constants/player-constants';
import type { SaveProgressPayload } from './use-watch-progress.types';

type ContentType = 'video' | 'short' | 'series_episode' | 'course_lesson';
type LastAction = SaveProgressPayload['last_action'];

interface UseWatchProgressParams {
  videoUuid: string | undefined;
  contentType: ContentType | undefined;
}

function getEndpoint(videoUuid: string, contentType: ContentType): string {
  switch (contentType) {
    case 'series_episode':
      return `/api/series/${videoUuid}/progress`;
    case 'course_lesson':
      return `/api/courses/${videoUuid}/progress`;
    default:
      return `/api/videos/${videoUuid}/progress`;
  }
}

function buildPayload(
  position: number,
  duration: number,
  lastAction: LastAction,
  playbackSpeed: number
): SaveProgressPayload {
  return {
    position: Math.round(position),
    duration: Math.round(duration),
    playback_speed: playbackSpeed,
    last_action: lastAction,
  };
}

function sendViaBeacon(url: string, payload: SaveProgressPayload): boolean {
  if (typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    return navigator.sendBeacon(url, blob);
  }
  return false;
}

function sendViaFetch(url: string, payload: SaveProgressPayload, keepalive = false): void {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive,
  }).catch(() => {
    // Fire-and-forget — swallow errors
  });
}

export function useWatchProgress({ videoUuid, contentType }: UseWatchProgressParams) {
  const positionRef = useRef(0);
  const durationRef = useRef(0);
  const playbackSpeedRef = useRef(1);
  const lastSaveTimeRef = useRef(0);
  const lastSavedPositionRef = useRef(0);
  const hasSavedRef = useRef(false);

  const videoUuidRef = useRef(videoUuid);
  const contentTypeRef = useRef(contentType);

  useEffect(() => {
    videoUuidRef.current = videoUuid;
    contentTypeRef.current = contentType;
  }, [videoUuid, contentType]);

  const save = useCallback((lastAction: LastAction, beacon = false) => {
    const uuid = videoUuidRef.current;
    const type = contentTypeRef.current;
    if (!uuid || !type) return;

    const position = positionRef.current;
    const duration = durationRef.current;
    if (duration <= 0) return;
    if (position < PROGRESS_SAVE_CONFIG.MIN_WATCH_THRESHOLD && lastAction !== 'complete') return;

    const url = getEndpoint(uuid, type);
    const payload = buildPayload(position, duration, lastAction, playbackSpeedRef.current);

    if (beacon) {
      if (!sendViaBeacon(url, payload)) {
        sendViaFetch(url, payload, true);
      }
    } else {
      sendViaFetch(url, payload);
    }

    lastSavedPositionRef.current = position;
    lastSaveTimeRef.current = Date.now();
    hasSavedRef.current = true;
  }, []);

  // visibilitychange + pagehide listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && videoUuidRef.current) {
        save('abandon', true);
      }
    };

    const handlePageHide = () => {
      if (videoUuidRef.current) {
        save('abandon', true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
    window.addEventListener('pagehide', handlePageHide, { passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [save]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (hasSavedRef.current || positionRef.current >= PROGRESS_SAVE_CONFIG.MIN_WATCH_THRESHOLD) {
        const uuid = videoUuidRef.current;
        const type = contentTypeRef.current;
        if (!uuid || !type) return;

        const url = getEndpoint(uuid, type);
        const payload = buildPayload(
          positionRef.current,
          durationRef.current,
          'abandon',
          playbackSpeedRef.current
        );
        if (!sendViaBeacon(url, payload)) {
          sendViaFetch(url, payload, true);
        }
      }
    };
  }, []);

  const handleProgressUpdate = useCallback(
    (currentTime: number, duration: number) => {
      positionRef.current = currentTime;
      durationRef.current = duration;

      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimeRef.current;
      const positionDelta = Math.abs(currentTime - lastSavedPositionRef.current);

      if (
        timeSinceLastSave >= PROGRESS_SAVE_CONFIG.THROTTLE_MS &&
        positionDelta >= PROGRESS_SAVE_CONFIG.MIN_POSITION_DELTA
      ) {
        save('play');
      }
    },
    [save]
  );

  const handlePause = useCallback(() => {
    save('pause');
  }, [save]);

  const handleSeek = useCallback(
    (time: number) => {
      positionRef.current = time;
      save('seek');
    },
    [save]
  );

  const handleEnded = useCallback(() => {
    positionRef.current = durationRef.current;
    save('complete');
  }, [save]);

  const handlePlay = useCallback(() => {
    playbackSpeedRef.current = 1;
  }, []);

  const handlePlaybackSpeedChange = useCallback((speed: number) => {
    playbackSpeedRef.current = speed;
  }, []);

  return {
    handleProgressUpdate,
    handlePause,
    handleSeek,
    handleEnded,
    handlePlay,
    handlePlaybackSpeedChange,
  };
}
