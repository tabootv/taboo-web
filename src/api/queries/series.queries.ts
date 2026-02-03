/**
 * Series Query Hooks
 *
 * TanStack Query hooks for series-related data fetching
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { SeriesListFilters } from '../client/series.client';
import { seriesClient } from '../client/series.client';
import { queryKeys } from '../query-keys';

/**
 * Hook to fetch list of series
 */
export function useSeriesList(params?: SeriesListFilters) {
  return useQuery({
    queryKey: queryKeys.series.list(params as Record<string, unknown>),
    queryFn: () => seriesClient.list(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch series with infinite scroll
 *
 * Stale time: 10 minutes
 */
export function useSeriesListInfinite(filters?: SeriesListFilters) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.series.list(filters as Record<string, unknown>), 'infinite'],
    queryFn: ({ pageParam = 1 }) => seriesClient.list({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch paginated series
 */
export function useSeriesListPaginated(page = 1, perPage = 12) {
  return useQuery({
    queryKey: queryKeys.series.list({ page, per_page: perPage }),
    queryFn: () => seriesClient.getAll(page, perPage),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch series detail
 * Stale time: 30 minutes (series metadata rarely changes)
 */
export function useSeriesDetail(id: string | number | null | undefined) {
  return useQuery({
    queryKey: queryKeys.series.detail(id!),
    queryFn: () => seriesClient.getDetail(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch series trailer
 */
export function useSeriesTrailer(id: string | number | null | undefined) {
  return useQuery({
    queryKey: queryKeys.series.trailer(id!),
    queryFn: () => seriesClient.getTrailer(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch series play data (video + episodes)
 */
export function useSeriesPlay(uuid: string | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.series.detail(uuid!), 'play'],
    queryFn: () => seriesClient.playVideo(uuid!),
    enabled: !!uuid,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
