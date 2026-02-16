'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import posthog from 'posthog-js';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';
import { PLAYER_CONFIG, STORAGE_KEYS } from '../../../constants/player-constants';
import type { SeekFeedback } from '../types';

const VOLUME_STORAGE_KEY = STORAGE_KEYS.VOLUME;
const CONTROLS_HIDE_DELAY = PLAYER_CONFIG.CONTROLS_HIDE_DELAY;
const FEEDBACK_DISPLAY_MS = PLAYER_CONFIG.FEEDBACK_DISPLAY_MS;

interface UsePlayerControlsParams {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  duration: number;
  isPlaying: boolean;
  showSettings: boolean;
  onSeek?: ((time: number) => void) | undefined;
  seekLimited?: boolean | undefined;
}

interface UsePlayerControlsReturn {
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  showControls: boolean;
  seekFeedback: SeekFeedback | null;
  volumeFeedback: number | null;
  togglePlay: () => void;
  handleVolumeChange: (volume: number) => void;
  toggleMute: () => void;
  seek: (seconds: number) => void;
  seekToPercent: (percent: number) => void;
  toggleFullscreen: () => Promise<void>;
  showControlsTemporarily: () => void;
  handleDoubleTap: (e: React.TouchEvent<HTMLDivElement>) => void;
}

export function usePlayerControls({
  videoRef,
  containerRef,
  duration,
  isPlaying,
  showSettings,
  onSeek,
  seekLimited,
}: UsePlayerControlsParams): UsePlayerControlsReturn {
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [seekFeedback, setSeekFeedback] = useState<SeekFeedback | null>(null);
  const [volumeFeedback, setVolumeFeedback] = useState<number | null>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const doubleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });

  // Load saved volume on mount
  useEffect(() => {
    const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (savedVolume) {
      const vol = Number.parseFloat(savedVolume);
      setVolume(vol);
      setIsMuted(vol === 0);
      if (videoRef.current) {
        videoRef.current.volume = vol;
      }
    }
  }, [videoRef]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (doubleTapTimeoutRef.current) clearTimeout(doubleTapTimeoutRef.current);
    };
  }, []);

  const saveVolume = useCallback((vol: number) => {
    localStorage.setItem(VOLUME_STORAGE_KEY, vol.toString());
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {}); // Suppress AbortError from rapid play/pause
    } else {
      videoRef.current.pause();
    }
  }, [videoRef]);

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      if (!videoRef.current) return;
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      videoRef.current.volume = clampedVolume;
      setVolume(clampedVolume);
      setIsMuted(clampedVolume === 0);
      saveVolume(clampedVolume);
      setVolumeFeedback(Math.round(clampedVolume * 100));
      setTimeout(() => setVolumeFeedback(null), FEEDBACK_DISPLAY_MS);
    },
    [videoRef, saveVolume]
  );

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    if (isMuted || volume === 0) {
      const newVol = volume === 0 ? 0.5 : volume;
      videoRef.current.volume = newVol;
      setVolume(newVol);
      setIsMuted(false);
      saveVolume(newVol);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [videoRef, isMuted, volume, saveVolume]);

  const seek = useCallback(
    (seconds: number) => {
      if (seekLimited) return; // Seeking disabled (corrupted lower qualities)
      if (!videoRef.current) return;
      const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = newTime;
      onSeek?.(newTime);
      setSeekFeedback({
        direction: seconds > 0 ? 'forward' : 'backward',
        seconds: Math.abs(seconds),
      });
      setTimeout(() => setSeekFeedback(null), FEEDBACK_DISPLAY_MS);
    },
    [seekLimited, videoRef, duration, onSeek]
  );

  const seekToPercent = useCallback(
    (percent: number) => {
      if (seekLimited) return; // Seeking disabled (corrupted lower qualities)
      if (!videoRef.current || !duration) return;
      const video = videoRef.current;
      const newTime = (percent / 100) * duration;
      video.currentTime = newTime;
      onSeek?.(newTime);
    },
    [seekLimited, videoRef, duration, onSeek]
  );

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        posthog.capture(AnalyticsEvent.VIDEO_FULLSCREEN_TOGGLED, { is_fullscreen: false });
      } else {
        await containerRef.current.requestFullscreen();
        posthog.capture(AnalyticsEvent.VIDEO_FULLSCREEN_TOGGLED, { is_fullscreen: true });
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, [containerRef]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying && !showSettings) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, CONTROLS_HIDE_DELAY);
    }
  }, [isPlaying, showSettings]);

  const handleDoubleTap = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const now = Date.now();
      const touch = e.touches[0] || e.changedTouches[0];
      if (!touch) return;
      const x = touch.clientX;
      const containerWidth = containerRef.current?.clientWidth || 0;

      if (now - lastTapRef.current.time < 300) {
        if (x < containerWidth / 3) {
          seek(-10);
        } else if (x > (containerWidth * 2) / 3) {
          seek(10);
        } else {
          togglePlay();
        }
      }
      lastTapRef.current = { time: now, x };
    },
    [containerRef, seek, togglePlay]
  );

  return {
    volume,
    isMuted,
    isFullscreen,
    showControls,
    seekFeedback,
    volumeFeedback,
    togglePlay,
    handleVolumeChange,
    toggleMute,
    seek,
    seekToPercent,
    toggleFullscreen,
    showControlsTemporarily,
    handleDoubleTap,
  };
}
