'use client';

import { useCallback } from 'react';
import { ShakaPlayer } from './shaka-player';
import { useVideoAnalytics } from '../hooks/use-video-analytics';

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

  const handlePlay = useCallback(() => {
    if (videoId) trackPlay();
  }, [videoId, trackPlay]);

  const handlePause = useCallback(() => {
    if (videoId) trackPause();
  }, [videoId, trackPause]);

  const handleSeek = useCallback(
    (time: number) => {
      if (videoId) trackSeek(time);
    },
    [videoId, trackSeek]
  );

  const handleEnded = useCallback(() => {
    if (videoId) trackCompleted();
    onEnded?.();
  }, [videoId, trackCompleted, onEnded]);

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
      onPlay={handlePlay}
      onPause={handlePause}
      onSeek={handleSeek}
      onEnded={handleEnded}
      className={className}
      isBunnyVideo={isBunnyVideo}
    />
  );
}
