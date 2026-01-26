/**
 * Public Content Query Hooks
 *
 * TanStack Query hooks for public content data fetching
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { MapVideosFilters, PublicVideosFilters } from '../client/public.client';
import { publicClient } from '../client/public.client';
import { queryKeys } from '../query-keys';

/**
 * Hook to fetch public videos
 *
 * Stale time: 10 minutes
 */
export function usePublicVideos(filters?: PublicVideosFilters) {
  return useQuery({
    queryKey: ['public', 'videos', filters],
    queryFn: () => publicClient.getVideos(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch map videos (returns videos array for simple queries)
 *
 * Stale time: 10 minutes
 * Search requires minimum 3 characters (server-side accent-insensitive)
 */
export function useMapVideos(filters?: MapVideosFilters) {
  return useQuery({
    queryKey: ['public', 'map-videos', filters],
    queryFn: async () => {
      const response = await publicClient.getMapVideos(filters);
      return response.videos;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !filters?.search || filters.search.length >= 3,
  });
}

/**
 * Filters for useMapVideosInfinite hook
 */
export interface MapVideosQueryFilters {
  search?: string | undefined;
  creators?: number | undefined;
  countries?: string[] | undefined;
  tag_ids?: number[] | undefined;
  sort_by?: string | undefined;
  types?: string | undefined;
  per_page?: number | undefined;
  short?: boolean | undefined;
}

/**
 * Hook to fetch map videos with infinite scroll support
 * Uses infinite query for pagination
 *
 * Stale time: 5 minutes
 */
export function useMapVideosInfinite(filters?: MapVideosQueryFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.videos.mapList(filters as Record<string, unknown>),
    queryFn: ({ pageParam = 1 }) => publicClient.getMapVideos({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.current_page < lastPage.pagination.last_page
        ? lastPage.pagination.current_page + 1
        : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch all available countries
 * Used for filter dropdowns - independent of video results
 * Stale time: 30 minutes (rarely changes)
 */
export function useCountries() {
  return useQuery({
    queryKey: ['public', 'countries'],
    queryFn: () => publicClient.getCountries(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch all available tags
 * Used for filter dropdowns - independent of video results
 * Stale time: 30 minutes (rarely changes)
 */
export function useTags() {
  return useQuery({
    queryKey: ['public', 'tags'],
    queryFn: () => publicClient.getTags(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch all available categories
 * Used for filter dropdowns - independent of video results
 * Stale time: 30 minutes (rarely changes)
 */
export function useCategories() {
  return useQuery({
    queryKey: ['public', 'categories'],
    queryFn: () => publicClient.getCategories(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
