'use client';

import { useCreatorSeriesInfinite } from '@/api/queries/creators.queries';
import { SeriesPremiumCard } from '@/app/(platform)/series/_components/SeriesPremiumCard';
import type { Creator, Series } from '@/types';
import { useMemo } from 'react';
import { InfiniteScrollLoader } from './shared/InfiniteScrollLoader';
import { EmptyState, SeriesGridSkeleton } from './shared/TabSkeletons';

interface CreatorSeriesTabProps {
  creator: Creator;
}

export function CreatorSeriesTab({ creator }: CreatorSeriesTabProps) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useCreatorSeriesInfinite(creator.id, { sort_by: 'latest' });

  const series = useMemo(() => {
    if (!data?.pages) return [];
    const allSeries = data.pages.flatMap((page) => page.data || []);

    // Deduplicate by id
    const uniqueMap = new Map<number, Series>();
    allSeries.forEach((item) => {
      if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
    });

    return Array.from(uniqueMap.values());
  }, [data]);

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white mb-6">
          Series
        </h2>
        <SeriesGridSkeleton count={6} />
      </section>
    );
  }

  if (series.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
        <EmptyState message="No series found." />
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white mb-6">
        Series
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {series.map((item) => (
          <SeriesPremiumCard key={item.id} series={item} />
        ))}
      </div>
      <InfiniteScrollLoader
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        skeleton={
          <div className="mt-5">
            <SeriesGridSkeleton count={3} />
          </div>
        }
      />
    </section>
  );
}
