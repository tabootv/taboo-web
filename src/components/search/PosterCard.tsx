'use client';

import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import {
  cn,
  formatCompactNumber,
  formatDuration,
  getCreatorRoute,
  getSeriesRoute,
} from '@/shared/utils/formatting';
import { Check, MoreHorizontal, Play, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';

interface PosterCardProps {
  id: string;
  uuid?: string | undefined;
  title: string;
  thumb: string;
  thumbWebp?: string | undefined;
  creatorName?: string | undefined;
  year?: number | undefined;
  duration?: number | undefined;
  views?: number | undefined;
  contentType?: 'video' | 'short' | 'series' | undefined;
  variant?: 'poster' | 'landscape' | 'short' | undefined;
  showActions?: boolean | undefined;
  className?: string | undefined;
  onClick?: (() => void) | undefined;
}

export function PosterCard({
  id,
  uuid,
  title,
  thumb,
  thumbWebp,
  creatorName,
  year,
  duration,
  views,
  contentType = 'video',
  variant = 'landscape',
  showActions = true,
  className,
  onClick,
}: PosterCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInList, setIsInList] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const href =
    contentType === 'short'
      ? `/shorts/${uuid || id}`
      : contentType === 'series'
        ? getSeriesRoute(id, title)
        : `/videos/${id}`;

  const aspectRatio =
    variant === 'short' ? 'aspect-[9/16]' : variant === 'poster' ? 'aspect-[2/3]' : 'aspect-video';

  const handleAddToList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInList(!isInList);
  };

  const handleMoreOptions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Open more options menu
  };

  return (
    <div
      ref={cardRef}
      className={cn('group relative flex-shrink-0', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={href} {...(onClick ? { onClick } : {})} className="block">
        <div
          className={cn(
            'relative overflow-hidden rounded-md bg-surface transition-all duration-300',
            aspectRatio,
            isHovered && 'scale-105 shadow-2xl shadow-black/50 z-10'
          )}
        >
          {/* Thumbnail */}
          <Image
            src={thumbWebp || thumb}
            alt={title}
            fill
            className="object-cover"
            sizes={variant === 'short' ? '150px' : '300px'}
          />

          {/* Gradient overlay on hover */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          />

          {/* Duration badge */}
          {duration && !isHovered && (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-medium text-white">
              {formatDuration(duration)}
            </div>
          )}

          {/* Content type badge */}
          {contentType === 'series' && !isHovered && (
            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-primary rounded text-[10px] font-semibold text-white uppercase">
              Series
            </div>
          )}

          {/* Hover content */}
          {isHovered && showActions && (
            <div className="absolute inset-0 flex flex-col justify-end p-3">
              {/* Action buttons */}
              <div className="flex items-center gap-2 mb-2">
                {/* Play button */}
                <button className="flex items-center justify-center w-9 h-9 bg-white rounded-full hover:bg-white/90 transition-colors">
                  <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                </button>

                {/* Add to list */}
                <button
                  onClick={handleAddToList}
                  className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors',
                    isInList
                      ? 'bg-white border-white'
                      : 'border-white/70 hover:border-white bg-black/40'
                  )}
                >
                  {isInList ? (
                    <Check className="w-4 h-4 text-black" />
                  ) : (
                    <Plus className="w-5 h-5 text-white" />
                  )}
                </button>

                {/* More options */}
                <button
                  onClick={handleMoreOptions}
                  className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-white/70 hover:border-white bg-black/40 transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Title and metadata */}
              <h3 className="font-semibold text-white text-sm line-clamp-1">{title}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-300 mt-0.5">
                {year && <span>{year}</span>}
                {duration && <span>{formatDuration(duration)}</span>}
                {views !== undefined && <span>{formatCompactNumber(views)} views</span>}
              </div>
              {creatorName && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{creatorName}</p>
              )}
            </div>
          )}
        </div>

        {/* Title below card (when not hovered) */}
        {!isHovered && (
          <div className="mt-2 px-0.5">
            <h3 className="font-medium text-text-primary text-sm line-clamp-2 group-hover:text-white transition-colors">
              {title}
            </h3>
            {creatorName && (
              <p className="text-xs text-text-secondary mt-0.5 truncate">{creatorName}</p>
            )}
          </div>
        )}
      </Link>
    </div>
  );
}

// Creator avatar card for "Creators" rail
interface CreatorAvatarCardProps {
  handler?: string | undefined;
  name: string;
  avatar: string;
  subscriberCount?: number | undefined;
  videoCount?: number | undefined;
  verified?: boolean | undefined;
  className?: string | undefined;
  onClick?: (() => void) | undefined;
}

export function CreatorAvatarCard({
  handler,
  name,
  avatar,
  subscriberCount,
  videoCount: _videoCount,
  verified,
  className,
  onClick,
}: CreatorAvatarCardProps) {
  return (
    <Link
      href={getCreatorRoute(handler)}
      {...(onClick ? { onClick } : {})}
      className={cn('flex flex-col items-center group flex-shrink-0', className)}
    >
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-surface ring-2 ring-transparent group-hover:ring-red-primary transition-all duration-300 group-hover:scale-105">
          <Image src={avatar} alt={name} fill className="object-cover" sizes="96px" />
        </div>
        {verified && (
          <div className="absolute bottom-0 right-0">
            <VerifiedBadge size={16} />
          </div>
        )}
      </div>
      <h3 className="mt-2 font-medium text-text-primary text-sm text-center line-clamp-1 group-hover:text-white transition-colors">
        {name}
      </h3>
      {subscriberCount !== undefined && (
        <p className="text-xs text-text-secondary">
          {formatCompactNumber(subscriberCount)} subscribers
        </p>
      )}
    </Link>
  );
}

// Tag chip for "Tags" rail
interface TagChipProps {
  id: string;
  name: string;
  count?: number | undefined;
  className?: string | undefined;
  onClick?: (() => void) | undefined;
}

export function TagChip({ id, name, count, className, onClick }: TagChipProps) {
  return (
    <Link
      href={`/tag/${id}`}
      {...(onClick ? { onClick } : {})}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-hover border border-border hover:border-red-primary/50 rounded-full transition-all duration-200 group flex-shrink-0',
        className
      )}
    >
      <span className="text-sm font-medium text-text-primary group-hover:text-white transition-colors">
        #{name}
      </span>
      {count !== undefined && (
        <span className="text-xs text-text-secondary">{formatCompactNumber(count)}</span>
      )}
    </Link>
  );
}
