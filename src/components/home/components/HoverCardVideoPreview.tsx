/**
 * Video preview player component for hover card
 */

import { memo } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface HoverCardVideoPreviewProps {
  previewUrl: string | null;
  isVideoPlaying: boolean;
  isVideoReady: boolean;
  isMuted: boolean;
  isExpanded: boolean;
  isHovered: boolean;
  isNew: boolean;
  duration: number | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onVideoLoaded: () => void;
  onToggleMute: (e: React.MouseEvent) => void;
}

export const HoverCardVideoPreview = memo(function HoverCardVideoPreview({
  previewUrl,
  isVideoPlaying,
  isVideoReady,
  isMuted,
  isExpanded,
  isHovered,
  isNew,
  duration,
  videoRef,
  onVideoLoaded,
  onToggleMute,
}: HoverCardVideoPreviewProps) {
  return (
    <>
      {/* Video Preview */}
      {previewUrl && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isVideoPlaying && isVideoReady ? 'opacity-100' : 'opacity-0'
          }`}
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          onLoadedData={onVideoLoaded}
        >
          <source src={previewUrl} type="video/mp4" />
        </video>
      )}

      {/* NEW tag */}
      {isNew && !isExpanded && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-primary text-white text-[10px] font-bold rounded">
          NEW
        </div>
      )}

      {/* Duration badge */}
      {duration && !isExpanded && (
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-[10px] rounded">
          {formatDuration(duration)}
        </div>
      )}

      {/* Play overlay for non-expanded state */}
      {!isExpanded && isHovered && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity">
          <div className="p-2 bg-red-primary/90 rounded-full transform scale-100 hover:scale-110 transition-transform">
            <Play className="w-4 h-4 text-white" fill="white" />
          </div>
        </div>
      )}

      {/* Volume control when video is playing */}
      {isExpanded && isVideoPlaying && previewUrl && (
        <button
          onClick={onToggleMute}
          className="absolute bottom-2 right-2 p-1.5 rounded-full bg-surface/80 border border-white/30 hover:border-white transition-colors z-10"
        >
          {isMuted ? (
            <VolumeX className="w-3 h-3 text-white" />
          ) : (
            <Volume2 className="w-3 h-3 text-white" />
          )}
        </button>
      )}

      {/* Gradient overlay when expanded */}
      {isExpanded && (
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
      )}
    </>
  );
});

