/**
 * Video player component for preview modal
 */

import Image from 'next/image';
import { Play, Volume2, VolumeX } from 'lucide-react';
import type { Video } from '@/types';

interface PreviewVideoPlayerProps {
  video: Video;
  thumbnail: string | null;
  previewUrl: string | null;
  isVideoPlaying: boolean;
  isVideoReady: boolean;
  isMuted: boolean;
  isNew: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onVideoReady: () => void;
  onPlay: () => void;
  onToggleMute: () => void;
}

export function PreviewVideoPlayer({
  video,
  thumbnail,
  previewUrl,
  isVideoPlaying,
  isVideoReady,
  isMuted,
  isNew,
  videoRef,
  onVideoReady,
  onPlay,
  onToggleMute,
}: PreviewVideoPlayerProps) {
  return (
    <div className="relative aspect-video bg-black">
      {/* Thumbnail */}
      {thumbnail && (
        <Image
          src={thumbnail}
          alt={video.title}
          fill
          className={`object-cover transition-opacity duration-500 ${
            isVideoPlaying && isVideoReady ? 'opacity-0' : 'opacity-100'
          }`}
          priority
        />
      )}

      {/* Video Preview */}
      {previewUrl && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isVideoPlaying && isVideoReady ? 'opacity-100' : 'opacity-0'
          }`}
          muted={isMuted}
          loop
          playsInline
          preload="auto"
          onLoadedData={onVideoReady}
        >
          <source src={previewUrl} type="video/mp4" />
        </video>
      )}

      {/* Gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface via-surface/60 to-transparent" />

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
        {/* Play Button */}
        <button
          onClick={onPlay}
          className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-white/90 text-black font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          <Play className="w-5 h-5 fill-black" />
          <span>Play</span>
        </button>

        {/* Volume Control */}
        {previewUrl && isVideoPlaying && (
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-full bg-black/60 border border-white/30 hover:border-white transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        )}
      </div>

      {/* NEW Badge */}
      {isNew && (
        <div className="absolute top-4 left-4 px-3 py-1 bg-red-primary text-white text-xs font-bold rounded">
          NEW
        </div>
      )}
    </div>
  );
}

