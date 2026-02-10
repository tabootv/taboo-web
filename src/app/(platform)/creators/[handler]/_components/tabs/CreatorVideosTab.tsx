'use client';

import { useCreatorVideosInfinite } from '@/api/queries/creators.queries';
import { SelectFilter } from '@/components/ui/select-filter';
import type { Creator, Video } from '@/types';
import { useMemo, useState } from 'react';
import { CreatorVideoGrid } from '../CreatorVideoGrid';
import { InfiniteScrollLoader } from './shared/InfiniteScrollLoader';
import { EmptyState, VideoGridSkeleton } from './shared/TabSkeletons';

interface CreatorVideosTabProps {
  creator: Creator;
}

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
];

export function CreatorVideosTab({ creator }: CreatorVideosTabProps) {
  const [sort, setSort] = useState('newest');
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useCreatorVideosInfinite(creator.id, { sort_by: sort });

  const videos = useMemo(() => {
    if (!data?.pages) return [];
    const allVideos = data.pages.flatMap((page) => page.data || []);

    // Deduplicate by uuid
    const uniqueMap = new Map<string, Video>();
    allVideos.forEach((video) => {
      const key = video.uuid || String(video.id);
      if (!uniqueMap.has(key)) uniqueMap.set(key, video);
    });

    return Array.from(uniqueMap.values());
  }, [data]);

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white mb-6">
          Videos
        </h2>
        <VideoGridSkeleton count={8} />
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
        <EmptyState message="No videos found." />
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-9">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
          Videos
        </h2>
        <SelectFilter label="Sort" value={sort} options={SORT_OPTIONS} onChange={setSort} />
      </div>
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
    </section>
  );
}
