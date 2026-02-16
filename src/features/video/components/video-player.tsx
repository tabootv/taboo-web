'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Caption, UserProgress } from '@/types';
import { ShakaPlayer } from './shaka-player';
import type { CaptionTrack, PlayerNavigationControls } from './shaka-player/types';
import { useVideoAnalytics } from '../hooks/use-video-analytics';
import { useWatchProgress } from '../hooks/use-watch-progress';

/** Duration < 90% of API reference = corrupted (truncated lower-quality MP4) */
const DURATION_CORRUPTION_THRESHOLD = 0.9;

interface VideoPlayerProps {
  thumbnail?: string;
  url_1440?: string | null;
  url_1080?: string | null;
  url_720?: string | null;
  url_480?: string | null;
  hls_url?: string | null;
  autoplay?: boolean;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  className?: string;
  isBunnyVideo?: boolean | undefined;
  captions?: Caption[] | undefined;
  userProgress?: UserProgress | null | undefined;
  // Analytics props — analytics only fire when videoId is provided
  videoId?: string | undefined;
  videoTitle?: string | undefined;
  channelName?: string | undefined;
  contentType?: 'video' | 'short' | 'series_episode' | 'course_lesson' | undefined;
  videoDuration?: number | undefined;
  navigationControls?: PlayerNavigationControls | undefined;
}

export function VideoPlayer({
  thumbnail,
  url_1440,
  url_1080,
  url_720,
  url_480,
  hls_url,
  autoplay = false,
  onProgress,
  onEnded,
  className = '',
  isBunnyVideo = false,
  captions,
  userProgress,
  videoId,
  videoTitle,
  channelName,
  contentType,
  videoDuration,
  navigationControls,
}: VideoPlayerProps) {
  const { trackPlay, trackPause, trackSeek, trackCompleted } = useVideoAnalytics(videoId ?? '', {
    title: videoTitle,
    channelName,
    contentType,
    duration: videoDuration,
  });

  const progress = useWatchProgress({ videoUuid: videoId, contentType });

  const handlePlay = useCallback(() => {
    if (videoId) trackPlay();
    progress.handlePlay();
  }, [videoId, trackPlay, progress]);

  const handlePause = useCallback(() => {
    if (videoId) trackPause();
    progress.handlePause();
  }, [videoId, trackPause, progress]);

  const handleSeek = useCallback(
    (time: number) => {
      if (videoId) trackSeek(time);
      progress.handleSeek(time);
    },
    [videoId, trackSeek, progress]
  );

  const handleEnded = useCallback(() => {
    if (videoId) trackCompleted();
    progress.handleEnded();
    onEnded?.();
  }, [videoId, trackCompleted, progress, onEnded]);

  const handleTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      progress.handleProgressUpdate(currentTime, duration);
    },
    [progress]
  );

  const captionTracks: CaptionTrack[] | undefined = useMemo(
    () =>
      captions?.map((c) => ({
        srclang: c.srclang,
        label: c.label,
        url: c.url,
      })),
    [captions]
  );

  const initialPosition = useMemo(() => {
    if (userProgress && !userProgress.completed && userProgress.position > 5) {
      return Math.max(0, userProgress.position - 2);
    }
    return undefined;
  }, [userProgress]);

  // Quality auto-fallback for MP4 stco (32-bit chunk offset) overflow.
  // When a seek fails on a >4GB MP4 (browser jumps to end), fall back to the
  // next lower quality whose file is likely <4GB, and re-seek to the target time.
  const mp4Srcs = useMemo(
    () => [url_1440, url_1080, url_720, url_480].filter(Boolean) as string[],
    [url_1440, url_1080, url_720, url_480]
  );

  const [mp4SrcIndex, setMp4SrcIndex] = useState(0);
  const [seekRecoveryPosition, setSeekRecoveryPosition] = useState<number | undefined>();

  // Proactive corruption detection: disable seeking when lower qualities are truncated
  const [seekLimited, setSeekLimited] = useState(false);
  const exhaustedRef = useRef(false);

  // Reset fallback state when the video source URLs change (e.g. navigating to a different video)
  useEffect(() => {
    setMp4SrcIndex(0);
    setSeekRecoveryPosition(undefined);
    setSeekLimited(false);
    exhaustedRef.current = false;
  }, [url_1440, url_1080, url_720, url_480]);

  // Proactive corruption detection: probe a lower quality URL's duration at mount
  useEffect(() => {
    // Only probe MP4 (not HLS), need both a reference duration and a lower quality to compare
    if (hls_url || !videoDuration || videoDuration <= 0) return;

    // Find first available lower quality (skip url_1440 which is the primary)
    const probeUrl = url_1080 || url_720 || url_480;
    if (!probeUrl) return; // Only one quality available, nothing to compare

    const probe = document.createElement('video');
    probe.preload = 'metadata';
    probe.muted = true;

    const cleanup = () => {
      probe.removeAttribute('src');
      probe.load(); // Force release of network resources
    };

    probe.addEventListener(
      'loadedmetadata',
      () => {
        const probeDuration = probe.duration;
        if (Number.isFinite(probeDuration) && probeDuration > 0) {
          const isTruncated = probeDuration < videoDuration * DURATION_CORRUPTION_THRESHOLD;
          if (isTruncated) {
            setSeekLimited(true);
            exhaustedRef.current = true;
          }
        }
        cleanup();
      },
      { once: true }
    );

    probe.addEventListener('error', () => cleanup(), { once: true });

    probe.src = probeUrl;

    return cleanup;
  }, [hls_url, videoDuration, url_1080, url_720, url_480]);

  const handleSeekFailed = useCallback(
    (targetTime: number) => {
      // If already exhausted (proactive detection or prior cascade), no-op to prevent loops
      if (exhaustedRef.current) return;

      setMp4SrcIndex((prev) => {
        if (prev >= mp4Srcs.length - 1) {
          // All qualities exhausted — disable seeking and fall back to original quality.
          exhaustedRef.current = true;
          setSeekLimited(true);
          return 0;
        }
        setSeekRecoveryPosition(targetTime);
        return prev + 1;
      });
    },
    [mp4Srcs.length]
  );

  // Signal to the player hook whether this is a recovery fallback load
  const isRecoveryLoad = seekRecoveryPosition !== undefined;

  // Clear seekRecoveryPosition after it has been consumed by the player
  const effectiveInitialPosition = seekRecoveryPosition ?? initialPosition;
  useEffect(() => {
    if (seekRecoveryPosition !== undefined) {
      setSeekRecoveryPosition(undefined);
    }
  }, [seekRecoveryPosition]);

  // Determine the best source URL: prefer HLS, then highest quality MP4
  // When in fallback mode (mp4SrcIndex > 0), use the fallback MP4 instead
  const src = hls_url || mp4Srcs[mp4SrcIndex] || url_1440 || url_1080 || url_720 || url_480;

  if (!src) {
    return (
      <div
        className={`relative bg-black aspect-video rounded-lg overflow-hidden flex items-center justify-center ${className}`}
      >
        <p className="text-white/60 text-sm">No video source available</p>
      </div>
    );
  }

  return (
    <ShakaPlayer
      src={src}
      thumbnail={thumbnail}
      autoplay={autoplay}
      onProgress={onProgress}
      onTimeUpdate={handleTimeUpdate}
      onPlay={handlePlay}
      onPause={handlePause}
      onSeek={handleSeek}
      onEnded={handleEnded}
      onSeekFailed={handleSeekFailed}
      seekLimited={seekLimited}
      className={className}
      isBunnyVideo={isBunnyVideo}
      captions={captionTracks}
      initialPosition={effectiveInitialPosition}
      isRecoveryLoad={isRecoveryLoad}
      navigationControls={navigationControls}
    />
  );
}
