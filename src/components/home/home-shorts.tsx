'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { home } from '@/lib/api';
import type { Video } from '@/types';
import { SectionCard } from '@/components/home';
import { ShortCard } from './components/ShortCard';
import { useHorizontalScroll } from './hooks/use-horizontal-scroll';

interface HomeShortsSectionProps {
  initialShorts?: Video[];
}

// Fisher-Yates shuffle - keeps first 3 recent, shuffles rest
function shuffleShorts(shorts: Video[]): Video[] {
  if (!shorts || shorts.length === 0) return [];

  const recent = shorts.slice(0, 3);
  const rest = [...shorts.slice(3)];

  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const temp = rest[i]!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    rest[i] = rest[j]!;
    rest[j] = temp;
  }

  return [...recent, ...rest];
}

export function HomeShortsSection({ initialShorts }: HomeShortsSectionProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { scrollRef, showLeftGradient, showRightGradient, scroll } = useHorizontalScroll();

  useEffect(() => {
    let cancelled = false;

    async function loadShorts() {
      // Try initialShorts first
      if (initialShorts && initialShorts.length > 0) {
        setVideos(shuffleShorts(initialShorts));
        setIsLoading(false);
        return;
      }

      // Fallback: fetch from API
      try {
        const data = await home.getShortVideosV2();
        if (!cancelled && data && data.length > 0) {
          setVideos(shuffleShorts(data));
        }
      } catch (error) {
        console.error('Error fetching shorts:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadShorts();

    return () => {
      cancelled = true;
    };
  }, [initialShorts]);

  if (isLoading) {
    return (
      <SectionCard title="Shorts" href="/shorts">
        <div className="flex gap-3 md:gap-6 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[169px] md:w-[190px] aspect-[9/16] rounded-lg skeleton"
            />
          ))}
        </div>
      </SectionCard>
    );
  }

  if (videos.length === 0) return null;

  return (
    <SectionCard title="Shorts" href="/shorts">
      <div className="relative group/section">
        {/* Left Gradient */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity ${
            showLeftGradient ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Right Gradient */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity ${
            showRightGradient ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Navigation Arrows */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 md:p-2.5 bg-black/80 rounded-full border border-white/20 opacity-0 group-hover/section:opacity-100 transition-all hover:bg-black hover:border-white/40 ${
            showLeftGradient ? '' : 'pointer-events-none !opacity-0'
          }`}
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </button>
        <button
          onClick={() => scroll('right')}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 md:p-2.5 bg-black/80 rounded-full border border-white/20 opacity-0 group-hover/section:opacity-100 transition-all hover:bg-black hover:border-white/40 ${
            showRightGradient ? '' : 'pointer-events-none !opacity-0'
          }`}
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </button>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-6 overflow-x-auto pb-4 hide-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {videos.map((video, index) => (
            <ShortCard key={video.uuid || video.id} video={video} index={index} />
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
