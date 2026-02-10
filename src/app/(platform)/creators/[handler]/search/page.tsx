'use client';

import { useMapVideosInfinite } from '@/api/queries/public.queries';
import type { Video } from '@/types';
import { useSearchParams } from 'next/navigation';
import { use, useMemo } from 'react';
import { CreatorVideoGrid } from '../_components/CreatorVideoGrid';
import { InfiniteScrollLoader } from '../_components/tabs/shared/InfiniteScrollLoader';
import { VideoGridSkeleton } from '../_components/tabs/shared/TabSkeletons';
import { useCreatorFromLayout } from '../_components/useCreatorFromLayout';

interface PageProps {
  params: Promise<{ handler: string }>;
}

export default function CreatorSearchPage({ params }: PageProps) {
  const { handler } = use(params);
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const { creator } = useCreatorFromLayout(handler);
  const channelId = creator?.id;

  const sort = 'latest';
  const countryFilter = 'all';
  const tagFilter = 'all';

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading } = useMapVideosInfinite(
    query.length >= 3 && channelId
      ? {
          creators: channelId,
          search: query,
          types: 'videos,series,courses,shorts',
          sort_by: sort,
          countries: countryFilter !== 'all' ? [countryFilter] : undefined,
          tag_ids: tagFilter !== 'all' ? [Number(tagFilter)] : undefined,
          per_page: 20,
        }
      : undefined
  );

  const videos = useMemo(() => {
    if (!data?.pages) return [];
    const all = data.pages.flatMap((page) => page.videos || []);
    const uniqueMap = new Map<string, Video>();
    all.forEach((v) => {
      const key = v.uuid || String(v.id);
      if (!uniqueMap.has(key)) uniqueMap.set(key, v);
    });
    return Array.from(uniqueMap.values());
  }, [data]);

  const totalResults = data?.pages?.[0]?.pagination?.total ?? 0;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
      {query.length < 3 && query.length > 0 && (
        <p className="text-white/50 text-sm">Type at least 3 characters to search.</p>
      )}

      {query.length === 0 && (
        <p className="text-white/50 text-sm">
          Search for videos, shorts, series, and courses from this creator.
        </p>
      )}

      {isLoading && query.length >= 3 && <VideoGridSkeleton count={8} />}

      {!isLoading && query.length >= 3 && videos.length === 0 && (
        <p className="text-white/50 text-center py-12">
          No results found for &ldquo;{query}&rdquo;
        </p>
      )}

      {videos.length > 0 && (
        <>
          <p className="text-white/40 text-sm mb-4">
            {totalResults} result{totalResults !== 1 ? 's' : ''}
          </p>
          <CreatorVideoGrid videos={videos} showAll />
          <InfiniteScrollLoader
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            skeleton={
              <div className="mt-5">
                <VideoGridSkeleton count={4} />
              </div>
            }
          />
        </>
      )}
    </section>
  );
}
