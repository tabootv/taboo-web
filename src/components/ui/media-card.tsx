'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Clock, Eye, Heart, Film, Lock } from 'lucide-react';
import { formatDuration, formatNumber, formatRelativeTime } from '@/lib/utils';

export interface MediaCardProps {
  /** Unique identifier */
  id: number | string;
  /** UUID for URL routing */
  uuid: string;
  /** Content type */
  type: 'video' | 'short' | 'series';
  /** Title of the content */
  title: string;
  /** Thumbnail URL */
  thumbnail: string;
  /** WebP thumbnail URL (optional) */
  thumbnailWebp?: string;
  /** Duration in seconds (videos only) */
  duration?: number;
  /** Number of episodes (series only) */
  episodeCount?: number;
  /** View count */
  views?: number;
  /** Like count */
  likes?: number;
  /** Creation/publish date */
  date?: string;
  /** Channel/Creator info */
  channel?: {
    id: number;
    name: string;
    slug: string;
    avatar?: string;
  };
  /** Is this NSFW content */
  isNsfw?: boolean;
  /** Is this premium/locked content */
  isPremium?: boolean;
  /** Tags/categories */
  tags?: string[];
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show hover preview video */
  showPreview?: boolean;
  /** Preview video URL */
  previewUrl?: string;
  /** Additional className */
  className?: string;
  /** Click handler (optional, defaults to Link) */
  onClick?: () => void;
  /** Optional hover intensity */
  hoverEffect?: 'default' | 'calm';
  /** Hide play overlay on hover */
  hidePlayOverlay?: boolean;
  /** Hide tags display */
  hideTags?: boolean;
}

/**
 * Unified media card component for videos, shorts, and series.
 * Provides consistent styling, hover effects, and metadata display.
 *
 * @example
 * // Video card
 * <MediaCard
 *   id={1}
 *   uuid="abc123"
 *   type="video"
 *   title="Amazing Video"
 *   thumbnail="/thumb.jpg"
 *   duration={320}
 *   views={15000}
 *   channel={{ name: "Creator", slug: "creator" }}
 * />
 *
 * @example
 * // Series card
 * <MediaCard
 *   id={1}
 *   uuid="xyz789"
 *   type="series"
 *   title="My Series"
 *   thumbnail="/series-thumb.jpg"
 *   episodeCount={12}
 *   views={50000}
 * />
 */
export function MediaCard({
  id,
  uuid,
  type,
  title,
  thumbnail,
  thumbnailWebp,
  duration,
  episodeCount,
  views,
  likes,
  date,
  channel,
  isNsfw,
  isPremium,
  tags,
  size = 'md',
  showPreview = false,
  previewUrl,
  className = '',
  onClick,
  hoverEffect = 'default',
  hidePlayOverlay = false,
  hideTags = false,
}: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Generate href based on type
  const href =
    type === 'series'
      ? `/series/${uuid}`
      : type === 'short'
      ? `/shorts/${uuid}`
      : `/videos/${uuid}`;

  // Aspect ratio based on type
  const aspectRatio = type === 'short' ? 'aspect-[9/16]' : 'aspect-video';

  // Size-based styles
  const sizeStyles = {
    sm: {
      title: 'text-sm line-clamp-1',
      meta: 'text-xs',
      avatar: 'w-6 h-6',
      padding: 'p-2',
    },
    md: {
      title: 'text-base line-clamp-2',
      meta: 'text-xs',
      avatar: 'w-8 h-8',
      padding: 'p-3',
    },
    lg: {
      title: 'text-lg line-clamp-2',
      meta: 'text-sm',
      avatar: 'w-10 h-10',
      padding: 'p-4',
    },
  };

  const styles = sizeStyles[size];

  const hoverClasses =
    hoverEffect === 'calm'
      ? 'hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:border-border-subtle'
      : 'hover:border-[rgba(171,0,19,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:-translate-y-1';

  const CardContent = () => (
    <div
      className={`
        group relative bg-card rounded-xl overflow-hidden
        border border-border-subtle
        transition-all duration-300
        ${hoverClasses}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className={`relative ${aspectRatio} overflow-hidden bg-surface`}>
        {/* Image */}
        <Image
          src={imageError ? '/placeholder-video.jpg' : (thumbnailWebp || thumbnail)}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
          sizes={
            size === 'sm'
              ? '(max-width: 640px) 50vw, 25vw'
              : size === 'lg'
              ? '(max-width: 640px) 100vw, 50vw'
              : '(max-width: 640px) 100vw, 33vw'
          }
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

      {/* Content */}
      <div className={styles.padding}>
        {/* Channel Info */}
        {channel && (
          <div className="flex items-start gap-2 mb-2">
            <div className={`${styles.avatar} relative rounded-full overflow-hidden flex-shrink-0 bg-surface`}>
              {channel.avatar ? (
                <Image
                  src={channel.avatar}
                  alt={channel.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {channel.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3 className={`title-card ${styles.title}`}>{title}</h3>

              {/* Channel Name */}
              <p className={`${styles.meta} text-text-secondary mt-0.5 truncate`}>
                {channel.name}
              </p>
            </div>
          </div>
        )}

        {/* Title without channel */}
        {!channel && (
          <h3 className={`title-card ${styles.title} mb-2`}>{title}</h3>
        )}

        {/* Metadata Row */}
        <div className={`flex items-center gap-3 ${styles.meta} text-text-secondary`}>
          {views !== undefined && (
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {formatNumber(views)}
            </span>
          )}
          {likes !== undefined && (
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              {formatNumber(likes)}
            </span>
          )}
          {date && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatRelativeTime(date)}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="text-left w-full">
        <CardContent />
      </button>
    );
  }

  return (
    <Link href={href}>
      <CardContent />
    </Link>
  );
}

export default MediaCard;
