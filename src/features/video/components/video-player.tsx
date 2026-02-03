'use client';

import { ShakaPlayer } from './shaka-player';

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
}: VideoPlayerProps) {
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
      onEnded={onEnded}
      className={className}
      isBunnyVideo={isBunnyVideo}
    />
  );
}
