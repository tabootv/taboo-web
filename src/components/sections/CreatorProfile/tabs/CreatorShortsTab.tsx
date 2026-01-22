'use client';

import { useCreatorShortsInfinite } from '@/api/queries/creators.queries';
import type { Creator, Video } from '@/types';
import { useMemo } from 'react';
import { CreatorShortsGrid } from '../CreatorShortsGrid';
import { EmptyState, InfiniteScrollLoader, ShortsGridSkeleton } from './shared';

interface CreatorShortsTabProps {
  creator: Creator;
}

export function CreatorShortsTab({ creator }: CreatorShortsTabProps) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useCreatorShortsInfinite(creator.id, { sort_by: 'latest' });

  const shorts = useMemo(() => {
    if (!data?.pages) return [];
    const allShorts = data.pages.flatMap((page) => page.data || []);

    // Deduplicate by uuid
    const uniqueMap = new Map<string, Video>();
    allShorts.forEach((short) => {
      const key = short.uuid || String(short.id);
      if (!uniqueMap.has(key)) uniqueMap.set(key, short);
    });

    return Array.from(uniqueMap.values());
  }, [data]);

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white mb-6">
          Shorts
        </h2>
        <ShortsGridSkeleton count={12} />
      </section>
    );
  }

  if (shorts.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
        <EmptyState message="No shorts found." />
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white mb-6">
        Shorts
      </h2>
      <CreatorShortsGrid shorts={shorts} />
      <InfiniteScrollLoader
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        skeleton={
          <div className="mt-5">
            <ShortsGridSkeleton count={6} />
          </div>
        }
      />
    </section>
  );
}
