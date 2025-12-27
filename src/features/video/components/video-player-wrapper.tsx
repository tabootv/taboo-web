'use client';

import { ShakaPlayer } from './shaka-player';
import { useVideoAnalytics } from '../hooks/use-video-analytics';

interface VideoPlayerWrapperProps {
  hlsUrl: string;
  videoId: string;
  thumbnail?: string;
  autoplay?: boolean;
  onEnded?: () => void;
}

/**
 * VideoPlayerWrapper component for streaming video content.
 *
 * Supports HLS streaming with quality selection and analytics tracking.
 */
export function VideoPlayerWrapper({
  hlsUrl,
  videoId,
  thumbnail,
  autoplay = false,
  onEnded,
}: VideoPlayerWrapperProps) {
  const { trackPlay, trackPause, trackSeek } = useVideoAnalytics(videoId);

  return (
    <ShakaPlayer
      src={hlsUrl}
      thumbnail={thumbnail}
      autoplay={autoplay}
      onPlay={() => trackPlay()}
      onPause={() => trackPause()}
      onSeek={(time: number) => trackSeek(time)}
      onEnded={onEnded}
    />
  );
}

