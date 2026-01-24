'use client';;
import type { VideoListFilters } from '@/api/client/video.client';
import { useCreatorsListPublic } from '@/api/queries/creators.queries';
import { useVideoList } from '@/api/queries/video.queries';
import { useCountries, useTags } from '@/api/queries/public.queries';
import { MediaPreviewModal } from '../home/_components/media-preview-modal';
import type { Video } from '@/types';
import { Film } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SelectFilter } from './components/select-filter';
import { VideoCardEnhanced } from './components/video-card-enhanced';
import { VideoGridSkeleton } from './components/video-grid-skeleton';
import { INFINITE_SCROLL_ROOT_MARGIN, INFINITE_SCROLL_THRESHOLD, PAGE_SIZE } from './constants';

type SortOption = 'trending' | 'newest' | 'oldest' | 'longest' | 'shortest';

export default function VideosPage() {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const lastCardRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [creatorFilter, setCreatorFilter] = useState<number | null>(null);
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<number | null>(null);
  const [sort, setSort] = useState<SortOption>('newest');
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);

  // Independent filter option sources (stable, don't change with video filters)
  const { data: creatorsData } = useCreatorsListPublic();
  const { data: countriesData } = useCountries();
  const { data: tagsData } = useTags();

  console.log(countriesData);

  // Build filter object, omitting undefined values for exactOptionalPropertyTypes compliance
  const videoFilters = useMemo(() => {
    const filters: VideoListFilters = {
      sort_by: sort,
      per_page: PAGE_SIZE,
      short: false,
    };
    if (creatorFilter !== null) filters.channel_id = creatorFilter;
    if (countryFilter !== null) filters.country_id = [countryFilter];
    if (tagFilter !== null) filters.tag_ids = [tagFilter];
    return filters;
  }, [creatorFilter, countryFilter, tagFilter, sort]);

  // Server-side filtered video list with infinite scroll via /api/videos endpoint
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isError, error } =
    useVideoList(videoFilters);

  // const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isError, error } = useMapVideosInfinite(videoFilters)

  // Server-filtered videos from API (deduplicated)
  const serverFilteredVideos = useMemo(() => {
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

  // Country options from dedicated countries API (simple string array)
  const countryOptions = useMemo(() => {
    return (countriesData?.data || []).map((country) => ({ label: country.name, value: String(country.id) }));
  }, [countriesData]);

  // Tag options from dedicated tags API (with id, name, count)
  const tagOptions = useMemo(() => {
    return (tagsData || [])
      .map((tag) => ({
        label: `${tag.name}`,
        value: tag.id.toString(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [tagsData]);

  // Display videos (server handles sorting via sort param)
  const displayVideos = serverFilteredVideos;

  // Creator options from dedicated creators API (always complete list)
  const creatorOptions = useMemo(() => {
    return (creatorsData?.data || [])
      .map((c) => ({ label: c.name, value: c.id }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [creatorsData]);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-[4%] py-8">
        {/* Page Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Videos</h1>

        {/* Filters - always visible */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <SelectFilter
            label="Creator"
            value={creatorFilter?.toString() || 'all'}
            onChange={(val) => setCreatorFilter(val === 'all' ? null : Number(val))}
            options={[
              { label: 'All creators', value: 'all' },
              ...creatorOptions.map((c) => ({ label: c.label, value: c.value.toString() })),
            ]}
          />

          <SelectFilter
            label="Country"
            value={countryFilter || 'all'}
            onChange={(val) => setCountryFilter(val === 'all' ? null : val)}
            options={[
              { label: 'All countries', value: 'all' },
              ...countryOptions
            ]}
          />

          <SelectFilter
            label="Tag"
            value={tagFilter?.toString() || 'all'}
            onChange={(val) => setTagFilter(val === 'all' ? null : Number(val))}
            options={[
              { label: 'All tags', value: 'all' },
              ...tagOptions,
            ]}
          />

          <SelectFilter
            label="Sort"
            value={sort}
            onChange={(val) => setSort(val as SortOption)}
            options={[
              // { label: 'Trending', value: 'trending' },
              { label: 'Newest', value: 'latest' },
              { label: 'Oldest', value: 'oldest' },
              // { label: 'Longest', value: 'longest' },
              // { label: 'Shortest', value: 'shortest' },
            ]}
          />
        </div>

        {isError && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 text-red-100 px-4 py-3 text-sm">
            {error?.message || 'Error loading videos'}
          </div>
        )}

        {/* Video grid - only this section shows skeleton during loading */}
        {isLoading ? (
          <VideoGridSkeleton count={PAGE_SIZE} />
        ) : displayVideos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
            {displayVideos.map((video, idx) => {
              const isLast = idx === displayVideos.length - 1;
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

        {!hasNextPage && displayVideos.length > 0 && (
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
