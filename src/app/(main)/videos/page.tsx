'use client';

import { LoadingScreen } from '@/components/ui';
import { VideoCard, VideoCardSkeleton, VideoEmptyState } from '@/components/video';
import { useVideoList } from '@/api/queries';
import { useMemo, useEffect, useRef } from 'react';
import { PAGE_SIZE } from './constants';

export default function VideosPage() {
  const skeletonKeyCounterRef = useRef(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
  } = useVideoList({
    short: false,
    is_short: false,
    type: 'video',
    published: true,
    sort_by: 'published_at',
    order: 'desc',
    per_page: PAGE_SIZE,
  });

  // Flatten pages into single array
  const videosList = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '600px', threshold: 0 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <LoadingScreen variant="feed" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm md:text-base font-semibold text-white/80 tracking-tight">Videos</p>
        </div>

        {isError && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 text-red-100 px-4 py-3 text-sm">
            {error?.message || 'Error loading videos'}
          </div>
        )}

        {videosList.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {videosList.map((video, idx) => {
                let uniqueKey: string;
                if (video.uuid) {
                  uniqueKey = `video-${video.uuid}-${idx}`;
                } else if (video.id) {
                  uniqueKey = `video-${video.id}-${idx}`;
                } else {
                  uniqueKey = `video-${idx}`;
                }
                return (
                  <div key={uniqueKey}>
                    <VideoCard video={video} />
                  </div>
                );
              })}
              {isFetchingNextPage &&
                (() => {
                  skeletonKeyCounterRef.current += 1;
                  return Array.from({ length: 6 }).map((_, i) => (
                    <VideoCardSkeleton
                      key={`video-skeleton-${skeletonKeyCounterRef.current}-${i}`}
                    />
                  ));
                })()}
            </div>

            <div ref={loadMoreRef} className="h-1" />
          </>
        ) : (
          <VideoEmptyState />
        )}

        {!hasNextPage && videosList.length > 0 && (
          <div className="flex justify-center mt-8 text-white/40 text-sm">You've seen it all</div>
        )}
      </div>
    </div>
  );
}
