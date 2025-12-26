'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MediaCardThumbnail } from './components/MediaCardThumbnail';
import { MediaCardContent } from './components/MediaCardContent';

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
  id: _id,
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
      <MediaCardThumbnail
        thumbnail={thumbnail}
        thumbnailWebp={thumbnailWebp}
        title={title}
        type={type}
        aspectRatio={aspectRatio}
        size={size}
        isHovered={isHovered}
        imageError={imageError}
        showPreview={showPreview}
        previewUrl={previewUrl}
        hidePlayOverlay={hidePlayOverlay}
        isNsfw={isNsfw}
        isPremium={isPremium}
        duration={duration}
        episodeCount={episodeCount}
        tags={tags}
        hideTags={hideTags}
        onImageError={() => setImageError(true)}
      />

      <MediaCardContent
        title={title}
        channel={channel}
        views={views}
        likes={likes}
        date={date}
        size={size}
      />
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
