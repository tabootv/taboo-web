/**
 * Series Query Hooks
 *
 * TanStack Query hooks for series-related data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { seriesClient } from '../client';
import { queryKeys } from '../query-keys';

/**
 * Hook to fetch list of series
 */
export function useSeriesList(params?: {
  page?: number;
  sort_by?: string;
  category_ids?: number[];
}) {
  return useQuery({
    queryKey: queryKeys.series.list(params),
    queryFn: () => seriesClient.list(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
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
