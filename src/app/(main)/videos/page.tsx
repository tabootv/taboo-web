'use client';

import { useVideoList } from '@/api/queries';
import { LoadingScreen, PageHeader, ContentGrid } from '@/components/ui';
import { VideoCard, VideoCardSkeleton } from '@/components/video';
import { useEffect, useMemo, useRef } from 'react';
import { PAGE_SIZE, INFINITE_SCROLL_ROOT_MARGIN, INFINITE_SCROLL_THRESHOLD } from './constants';

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
      { rootMargin: INFINITE_SCROLL_ROOT_MARGIN, threshold: INFINITE_SCROLL_THRESHOLD }
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
        <PageHeader title="Videos" />

        {isError && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 text-red-100 px-4 py-3 text-sm">
            {error?.message || 'Error loading videos'}
          </div>
        )}

        {videosList.length > 0 ? (
          <>
            <ContentGrid variant="media" className="mt-6">
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
                  <VideoCard key={uniqueKey} video={video} />
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
            </ContentGrid>

            <div ref={loadMoreRef} className="h-1" />
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-white/50">No videos found</p>
          </div>
        )}

        {!hasNextPage && videosList.length > 0 && (
          <div className="flex justify-center mt-8 text-white/40 text-sm">You've seen it all</div>
        )}
      </div>
    </div>
  );
}
