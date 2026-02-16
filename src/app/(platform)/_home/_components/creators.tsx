'use client';

import { useCreators } from '@/api/queries/home.queries';
import { SectionCard } from './section-card';
import { getCreatorRoute } from '@/shared/utils/formatting';
import type { Creator } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

interface CreatorsSectionProps {
  initialCreators?: Creator[];
}

export function CreatorsSection({ initialCreators }: CreatorsSectionProps) {
  const { data: creators = [], isLoading } = useCreators(
    initialCreators ? { initialData: initialCreators } : {}
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftGradient(scrollLeft > 20);
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 20);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => el.removeEventListener('scroll', handleScroll);
    }
    return undefined;
  }, [handleScroll, creators]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return (
      <SectionCard title="Creators">
        <div className="flex gap-4 md:gap-6 overflow-hidden px-2 py-6">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={`creator-skeleton-${i}`}
              className="shrink-0 text-center"
              style={{ width: 110 }}
            >
              <div
                className="w-[90px] h-[90px] rounded-full bg-surface animate-pulse mx-auto"
                style={{ boxShadow: '0 0 20px rgba(171, 0, 19, 0.2)' }}
              />
              <div className="w-20 h-4 bg-surface rounded animate-pulse mx-auto mt-3" />
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }

  if (creators.length === 0) return null;

  return (
    <SectionCard title="Creators">
      <div className="relative group/section">
        <div
          className={`absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-background to-transparent z-10 pointer-events-none transition-opacity ${
            showLeftGradient ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-background to-transparent z-10 pointer-events-none transition-opacity ${
            showRightGradient ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 md:p-2.5 bg-black/80 rounded-full border border-white/20 opacity-0 group-hover/section:opacity-100 transition-all hover:bg-black hover:border-white/40 ${
            showLeftGradient ? '' : 'pointer-events-none opacity-0!'
          }`}
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </button>
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 md:p-2.5 bg-black/80 rounded-full border border-white/20 opacity-0 group-hover/section:opacity-100 transition-all hover:bg-black hover:border-white/40 ${
            showRightGradient ? '' : 'pointer-events-none opacity-0!'
          }`}
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar scroll-smooth px-2 -mx-2 py-6 -my-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {creators.map((creator) => {
            const channel = creator.user?.channel;
            const displayName = channel?.name || creator.name || 'Creator';
            const displayImage = channel?.dp || creator.dp;
            const creatorHandler = channel?.handler || creator.handler;
            const creatorId = channel?.id || creator.id;

            return (
              <Link
                key={creatorId}
                href={getCreatorRoute(creatorHandler)}
                className="shrink-0 text-center group"
                style={{ width: 110 }}
              >
                <div
                  className="relative w-[90px] h-[90px] mx-auto rounded-full border-2 border-transparent group-hover:border-red-primary/50 z-10 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-[1.02] [box-shadow:0_0_20px_rgba(171,0,19,0.3)] group-hover:[box-shadow:0_0_35px_rgba(171,0,19,0.7)]"
                  aria-hidden="true"
                >
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    {displayImage ? (
                      <Image
                        src={displayImage}
                        alt={displayName}
                        fill
                        sizes="90px"
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-red-primary to-red-dark flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-sm text-text-primary group-hover:text-red-primary transition-colors truncate">
                  {displayName.length > 20 ? `${displayName.substring(0, 20)}...` : displayName}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}
