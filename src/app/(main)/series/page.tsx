'use client';
import { useCreatorsListPublic } from '@/api/queries/creators.queries';
import { useSeriesListInfinite } from '@/api/queries/series.queries';
import { SelectFilter } from '@/components/ui/select-filter';
import { Play } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SeriesCardSkeleton } from './_components/SeriesCardSkeleton';
import { SeriesPremiumCard } from './_components/SeriesPremiumCard';
import { INFINITE_SCROLL_ROOT_MARGIN, INFINITE_SCROLL_THRESHOLD, PAGE_SIZE } from './constants';

type SortOption = 'newest' | 'old';

export default function SeriesPage() {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [creatorFilter, setCreatorFilter] = useState<number | null>(null);
  const [sort, setSort] = useState<SortOption>('newest');

  // Build filter object
  const seriesFilters = useMemo(() => {
    const filters: { sort_by: string; per_page: number; channel_id?: number } = {
      sort_by: sort,
      per_page: PAGE_SIZE,
    };
    if (creatorFilter !== null) filters.channel_id = creatorFilter;
    return filters;
  }, [creatorFilter, sort]);

  // Server-side filtered series list with infinite scroll
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useSeriesListInfinite(seriesFilters);

  // Fetch creators for filter dropdown
  const { data: creatorsData } = useCreatorsListPublic();

  // Creator options from dedicated creators API
  const creatorOptions = useMemo(() => {
    return (creatorsData?.data || [])
      .map((c) => ({ label: c.name, value: c.id.toString() }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [creatorsData]);

  // Flatten paginated data
  const seriesList = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data]);

  // Skeleton keys for initial loading
  const skeletonKeys = useMemo(
    () =>
      Array.from(
        { length: 8 },
        (_, i) => `series-skeleton-${i}-${Math.random().toString(36).substring(2, 9)}`
      ),
    []
  );

  // Infinite scroll observer
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
    <div className="relative z-10 mx-auto page-px py-12">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Series</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <SelectFilter
          label="Creator"
          value={creatorFilter?.toString() || 'all'}
          onChange={(val) => setCreatorFilter(val === 'all' ? null : Number(val))}
          options={[{ label: 'All creators', value: 'all' }, ...creatorOptions]}
        />

        <SelectFilter
          label="Sort"
          value={sort}
          onChange={(val) => setSort(val as SortOption)}
          options={[
            { label: 'Newest', value: 'newest' },
            { label: 'Oldest', value: 'old' },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="grid-series">
          {skeletonKeys.map((key: string) => (
            <SeriesCardSkeleton key={key} />
          ))}
        </div>
      ) : seriesList.length > 0 ? (
        <>
          <div className="grid-series">
            {seriesList.map((series) => (
              <SeriesPremiumCard key={series.uuid} series={series} />
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          {hasNextPage && <div ref={loadMoreRef} className="h-10 opacity-0" aria-hidden="true" />}

          {/* Loading more skeletons */}
          {isFetchingNextPage && (
            <div className="grid-series mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SeriesCardSkeleton key={`loading-more-${i}`} />
              ))}
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-[#131315] flex items-center justify-center mb-6">
            <Play className="w-8 h-8 text-red-primary" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No series found</h3>
          <p className="text-text-secondary max-w-md">
            Check back later for new dangerous content from our creators.
          </p>
        </div>
      )}
    </div>
  );
}
