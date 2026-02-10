'use client';

import { useCallback, useMemo } from 'react';
import type { Caption, UserProgress } from '@/types';
import { ShakaPlayer } from './shaka-player';
import type { CaptionTrack } from './shaka-player/types';
import { useVideoAnalytics } from '../hooks/use-video-analytics';
import { useWatchProgress } from '../hooks/use-watch-progress';

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

  // Determine the best source URL: prefer HLS, then highest quality MP4
  const src = hls_url || url_1440 || url_1080 || url_720 || url_480;

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
      className={className}
      isBunnyVideo={isBunnyVideo}
      captions={captionTracks}
      initialPosition={initialPosition}
    />
  );
}
