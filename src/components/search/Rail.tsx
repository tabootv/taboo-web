'use client';

import type { SearchCreator, SearchItem, SearchTag, SearchTitle } from '@/api/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CreatorAvatarCard, PosterCard, TagChip } from './PosterCard';

interface RailProps {
  label: string;
  items: SearchItem[];
  type?: 'titles' | 'creators' | 'tags';
  onItemClick?: () => void;
  className?: string;
}

export function Rail({ label, items, type: _type = 'titles', onItemClick, className }: RailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkArrows = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  }, []);

  useEffect(() => {
    checkArrows();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkArrows, { passive: true });
      window.addEventListener('resize', checkArrows);
      return () => {
        el.removeEventListener('scroll', checkArrows);
        window.removeEventListener('resize', checkArrows);
      };
    }
    return undefined;
  }, [checkArrows, items]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <section className={cn('relative group/rail', className)}>
      {/* Header */}
      <h2 className="text-lg font-semibold text-text-primary mb-3 px-4 md:px-0">{label}</h2>

      {/* Rail container */}
      <div className="relative -mx-4 md:mx-0">
        {/* Left arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-background via-background/80 to-transparent flex items-center justify-start pl-2 opacity-0 group-hover/rail:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <div className="w-10 h-10 rounded-full bg-surface/90 backdrop-blur flex items-center justify-center hover:bg-hover transition-colors">
              <ChevronLeft className="w-6 h-6 text-text-primary" />
            </div>
          </button>
        )}

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-4 px-4 md:px-0 hide-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, index) => {
            if (item.type === 'title') {
              const titleItem = item as SearchTitle;
              return (
                <PosterCard
                  key={`${titleItem.id}-${index}`}
                  id={titleItem.id}
                  {...(titleItem.uuid && { uuid: titleItem.uuid })}
                  title={titleItem.title}
                  thumb={titleItem.thumb}
                  {...(titleItem.thumbWebp && { thumbWebp: titleItem.thumbWebp })}
                  {...(titleItem.creatorName && { creatorName: titleItem.creatorName })}
                  {...(titleItem.year && { year: titleItem.year })}
                  {...(titleItem.duration !== undefined && { duration: titleItem.duration })}
                  {...(titleItem.views !== undefined && { views: titleItem.views })}
                  {...(titleItem.contentType && { contentType: titleItem.contentType })}
                  variant={titleItem.contentType === 'short' ? 'short' : 'landscape'}
                  className={titleItem.contentType === 'short' ? 'w-32' : 'w-56 md:w-64'}
                  {...(onItemClick && { onClick: onItemClick })}
                />
              );
            }

            if (item.type === 'creator') {
              const creatorItem = item as SearchCreator;
              return (
                <CreatorAvatarCard
                  key={`${creatorItem.id}-${index}`}
                  handler={creatorItem.handler}
                  name={creatorItem.name}
                  avatar={creatorItem.avatar}
                  subscriberCount={creatorItem.subscriberCount}
                  videoCount={creatorItem.videoCount}
                  {...(creatorItem.verified !== undefined && { verified: creatorItem.verified })}
                  {...(onItemClick && { onClick: onItemClick })}
                />
              );
            }

            if (item.type === 'tag') {
              const tagItem = item as SearchTag;
              return (
                <TagChip
                  key={`${tagItem.id}-${index}`}
                  id={tagItem.id}
                  name={tagItem.name}
                  count={tagItem.count}
                  {...(onItemClick && { onClick: onItemClick })}
                />
              );
            }

            return null;
          })}
        </div>

        {/* Right arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-linear-to-l from-background via-background/80 to-transparent flex items-center justify-end pr-2 opacity-0 group-hover/rail:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <div className="w-10 h-10 rounded-full bg-surface/90 backdrop-blur flex items-center justify-center hover:bg-hover transition-colors">
              <ChevronRight className="w-6 h-6 text-text-primary" />
            </div>
          </button>
        )}
      </div>
    </section>
  );
}

// Skeleton loader for Rail
export function RailSkeleton({ variant = 'titles' }: { variant?: 'titles' | 'creators' | 'tags' }) {
  const itemCount = variant === 'creators' ? 6 : variant === 'tags' ? 8 : 5;

  return (
    <section className="relative">
      {/* Label skeleton */}
      <div className="h-6 w-32 bg-surface rounded animate-pulse mb-3" />

      {/* Items skeleton */}
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: itemCount }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'shrink-0 bg-surface rounded animate-pulse',
              variant === 'creators' && 'w-24 h-36',
              variant === 'tags' && 'w-28 h-10 rounded-full',
              variant === 'titles' && 'w-56 md:w-64 aspect-video rounded-md'
            )}
          />
        ))}
      </div>
    </section>
  );
}
