'use client';

import { LoadingScreen } from '@/components/ui';
import { VideoCard, VideoCardSkeleton, VideoEmptyState } from '@/components/video';
import { videos as videosApi } from '@/lib/api';
import { useInfiniteScrollPagination } from '@/lib/hooks/use-infinite-scroll-pagination';
import type { Video } from '@/types';
import { useRef } from 'react';
import { PAGE_SIZE } from './constants';

export default function VideosPage() {
  const skeletonKeyCounterRef = useRef(0);

  const {
    items: videosList,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMoreRef,
  } = useInfiniteScrollPagination<Video>({
    fetchPage: async (pageNum) => {
      const page = typeof pageNum === 'number' ? pageNum : 1;
      const response = await videosApi.getLongForm(page, PAGE_SIZE);
      let items = response.data || [];

      if (process.env.NODE_ENV === 'development') {
        console.log('VIDEOS REQUEST', {
          url: `/public/videos?page=${page}&limit=${PAGE_SIZE}&short=false&type=video&published=true`,
          sample: items.slice(0, 5).map((v: any) => ({
            id: v?.id,
            uuid: v?.uuid,
            short: v?.short,
            is_short: v?.is_short,
            type: v?.type,
            published_at: v?.published_at,
          })),
        });
        const leaked = items.find(
          (v: any) => v?.short === true || v?.is_short === true || v?.type === 'short'
        );
        if (leaked) {
          console.error('SHORT CONTENT LEAKED INTO /videos', leaked);
          throw new Error('SHORT CONTENT LEAKED INTO /videos');
        }
      }

      items = items.filter(
        (v: any) =>
          v?.short === false ||
          v?.is_short === false ||
          v?.type === 'video' ||
          v?.short === undefined
      );

      return {
        data: items,
        currentPage: response.current_page ?? page,
        lastPage: response.last_page ?? page,
      };
    },
    initialPage: 1,
    rootMargin: '600px',
    threshold: 0,
  });

  if (isLoading) {
    return <LoadingScreen variant="feed" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm md:text-base font-semibold text-white/80 tracking-tight">Videos</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 text-red-100 px-4 py-3 text-sm">
            {error}
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
              {isLoadingMore &&
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

        {!hasMore && videosList.length > 0 && (
          <div className="flex justify-center mt-8 text-white/40 text-sm">You've seen it all</div>
        )}
      </div>
    </div>
  );
}
