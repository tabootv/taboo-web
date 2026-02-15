/**
 * Thumbnail section component for MediaCard
 */

import Image from 'next/image';
import { Play, Film, Lock } from 'lucide-react';
import { formatDuration } from '@/shared/utils/formatting';
import type { MediaCardProps } from '../media-card';

interface MediaCardThumbnailProps {
  thumbnail: string;
  thumbnailWebp?: string | undefined;
  title: string;
  type: MediaCardProps['type'];
  aspectRatio: string;
  size: MediaCardProps['size'];
  isHovered: boolean;
  imageError: boolean;
  showPreview?: boolean | undefined;
  previewUrl?: string | undefined;
  hidePlayOverlay?: boolean | undefined;
  isNsfw?: boolean | undefined;
  isPremium?: boolean | undefined;
  duration?: number | undefined;
  episodeCount?: number | undefined;
  tags?: string[] | undefined;
  hideTags?: boolean | undefined;
  onImageError: () => void;
}

export function MediaCardThumbnail({
  thumbnail,
  thumbnailWebp,
  title,
  type,
  aspectRatio,
  size = 'md',
  isHovered,
  imageError,
  showPreview,
  previewUrl,
  hidePlayOverlay,
  isNsfw,
  isPremium,
  duration,
  episodeCount,
  tags,
  hideTags,
  onImageError,
}: MediaCardThumbnailProps) {
  const imageSizes = {
    sm: '(max-width: 640px) 45vw, 200px',
    md: '(max-width: 640px) 90vw, (max-width: 1024px) 33vw, 300px',
    lg: '(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 450px',
  };

  return (
    <div className={`relative ${aspectRatio} overflow-hidden bg-surface`}>
      {/* Image */}
      <Image
        src={imageError ? '/placeholder-video.jpg' : thumbnailWebp || thumbnail}
        alt={title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        onError={onImageError}
        sizes={imageSizes[size]}
      />

      {/* Preview Video on Hover */}
      {showPreview && previewUrl && isHovered && (
        <video
          src={previewUrl}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Play Button on Hover */}
      {!hidePlayOverlay && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-red-primary/90 flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
      )}

      {/* Badges Container */}
      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
        {/* NSFW Badge */}
        {isNsfw && (
          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-red-primary text-white rounded">
            18+
          </span>
        )}

        {/* Premium Badge */}
        {isPremium && (
          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-yellow-500 text-black rounded flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" />
            Premium
          </span>
        )}

        {/* Series Badge */}
        {type === 'series' && (
          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-white/20 backdrop-blur text-white rounded flex items-center gap-1">
            <Film className="w-2.5 h-2.5" />
            Series
          </span>
        )}
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
        {/* Duration / Episode Count */}
        {(duration || episodeCount) && (
          <span className="px-2 py-0.5 text-[11px] font-medium bg-black/80 text-white rounded">
            {duration ? formatDuration(duration) : `${episodeCount} episodes`}
          </span>
        )}

        {/* Tags (first 2) */}
        {!hideTags && tags && tags.length > 0 && (
          <div className="flex gap-1">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] bg-red-primary/80 text-white rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
