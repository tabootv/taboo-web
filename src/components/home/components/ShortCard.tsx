/**
 * Individual short card component with video preview
 */

import Image from 'next/image';
import Link from 'next/link';
import { Volume2, VolumeX, Play } from 'lucide-react';
import { useShortVideoPreview } from '../hooks/use-short-video-preview';
import type { Video } from '@/types';

interface ShortCardProps {
  video: Video;
  index: number;
}

export function ShortCard({ video, index }: ShortCardProps) {
  const {
    thumbnail,
    previewUrl,
    isHovered,
    isFetchingUrl,
    showVideo,
    isMuted,
    videoRef,
    handleMouseEnter,
    handleMouseLeave,
    handleVideoLoaded,
    toggleMute,
  } = useShortVideoPreview(video);

  return (
    <Link
      href={`/shorts/${video.uuid}`}
      className="flex-shrink-0 w-[169px] md:w-[190px] group relative rounded-lg overflow-hidden cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-[9/16]">
        {/* Thumbnail */}
        {thumbnail && (
          <Image
            src={thumbnail}
            alt={video.title || 'Short video'}
            fill
            className={`object-cover transition-opacity duration-300 ${
              showVideo ? 'opacity-0' : 'opacity-100'
            }`}
            priority={index < 6}
          />
        )}

        {/* Video preview on hover */}
        {previewUrl && (
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              showVideo ? 'opacity-100' : 'opacity-0'
            }`}
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            onLoadedData={handleVideoLoaded}
          >
            <source src={previewUrl} type="video/mp4" />
          </video>
        )}

        {/* Loading indicator while fetching video URL */}
        {isHovered && isFetchingUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Play icon overlay when hovered but video not playing yet */}
        {isHovered && !showVideo && !isFetchingUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="p-3 bg-white/90 rounded-full">
              <Play className="w-5 h-5 text-black" fill="black" />
            </div>
          </div>
        )}

        {/* Volume control when video is playing */}
        {showVideo && (
          <button
            onClick={toggleMute}
            className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 border border-white/30 hover:border-white transition-colors z-10"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </button>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Border on hover */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ring-2 ring-red-primary/60" />
      </div>
    </Link>
  );
}

