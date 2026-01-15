'use client';

import { useVideoList } from '@/api/queries';
import { MediaPreviewModal } from '@/components/home/media-preview-modal';
import { LoadingScreen } from '@/components/ui';
import type { Video } from '@/types';
import { Film } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SelectFilter } from './components/select-filter';
import { VideoCardEnhanced } from './components/video-card-enhanced';
import { INFINITE_SCROLL_ROOT_MARGIN, INFINITE_SCROLL_THRESHOLD, PAGE_SIZE } from './constants';
import type { SortOption } from './types';

export default function VideosPage() {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const lastCardRef = useRef<HTMLDivElement>(null);

  const [sort, setSort] = useState<SortOption>('newest');
  const [creatorFilter, setCreatorFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isError, error } =
    useVideoList({
      short: false,
      is_short: false,
      type: 'video',
      published: true,
      sort_by: 'published_at',
      order: 'desc',
      per_page: PAGE_SIZE,
    });

  const videosList = useMemo(() => {
    const allVideos = data?.pages.flatMap((page) => page.data) || [];

    // Deduplicate by uuid (primary) or id (fallback) to prevent duplicate key errors
    const uniqueVideosMap = new Map<string, Video>();
    allVideos.forEach((video) => {
      const key = video.uuid || String(video.id);
      if (!uniqueVideosMap.has(key)) {
        uniqueVideosMap.set(key, video);
      }
    });

    return Array.from(uniqueVideosMap.values());
  }, [data]);

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

  const creatorOptions = useMemo(() => {
    const names = new Set<string>();
    videosList.forEach((v) => {
      if (v.channel?.name) names.add(v.channel.name);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [videosList]);

  const tagOptions = useMemo(() => {
    const tags = new Set<string>();
    videosList.forEach((v) => {
      v.tags?.forEach((t) => {
        if (t?.name) tags.add(t.name);
        else if (t?.slug) tags.add(t.slug);
      });
    });
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [videosList]);

  const filteredVideos = useMemo(() => {
    let list = [...videosList];

    if (creatorFilter !== 'all') {
      list = list.filter((v) => v.channel?.name === creatorFilter);
    }

    if (tagFilter !== 'all') {
      list = list.filter((v) =>
        v.tags?.some((t) => t?.name === tagFilter || t?.slug === tagFilter)
      );
    }

    list.sort((a, b) => {
      if (sort === 'newest') {
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      }
      if (sort === 'oldest') {
        return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
      }
      const ad = a.duration || 0;
      const bd = b.duration || 0;
      if (sort === 'longest') return bd - ad;
      if (sort === 'shortest') return ad - bd;
      return 0;
    });

    return list;
  }, [videosList, creatorFilter, tagFilter, sort]);

  if (isLoading) {
    return <LoadingScreen variant="feed" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-[4%] py-8">
        {/* Page Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Videos</h1>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <SelectFilter
              label="Creator"
              value={creatorFilter}
              onChange={setCreatorFilter}
              options={[
                { label: 'All creators', value: 'all' },
                ...creatorOptions.map((c) => ({ label: c, value: c })),
              ]}
            />

            <SelectFilter
              label="Tags"
              value={tagFilter}
              onChange={setTagFilter}
              options={[
                { label: 'All tags', value: 'all' },
                ...tagOptions.map((t) => ({ label: t, value: t })),
              ]}
            />

            <SelectFilter
              label="Sort"
              value={sort}
              onChange={(val) => setSort(val as SortOption)}
              options={[
                { label: 'Newest', value: 'newest' },
                { label: 'Oldest', value: 'oldest' },
                { label: 'Longest', value: 'longest' },
                { label: 'Shortest', value: 'shortest' },
              ]}
            />
          </div>
        </div>

        {isError && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 text-red-100 px-4 py-3 text-sm">
            {error?.message || 'Error loading videos'}
          </div>
        )}

        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
            {filteredVideos.map((video, idx) => {
              const isLast = idx === filteredVideos.length - 1;
              return (
                <div
                  key={`video-${video.uuid || video.id || `idx-${idx}`}`}
                  ref={isLast ? lastCardRef : null}
                >
                  <VideoCardEnhanced
                    video={video}
                    priority={idx < 8}
                    onOpenPreview={setPreviewVideo}
                  />
                </div>
              );
            })}
            {isFetchingNextPage &&
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <Film className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/50">No videos found</p>
          </div>
        )}

        {!hasNextPage && filteredVideos.length > 0 && (
          <div className="flex justify-center mt-8 text-white/40 text-sm">You've seen it all</div>
        )}

        <div ref={loadMoreRef} className="h-1" />
      </div>

      <MediaPreviewModal video={previewVideo} onClose={() => setPreviewVideo(null)} />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface" />
      <div className="h-4 bg-surface mt-2 rounded" />
      <div className="h-3 bg-surface mt-1 rounded w-2/3" />
    </div>
  );
}
