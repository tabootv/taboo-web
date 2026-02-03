/**
 * Home Feed Query Hooks
 *
 * TanStack Query hooks for home page data fetching
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { homeClient } from '../client/home.client';
import { queryKeys } from '../query-keys';
import type { HomePageData } from '@/shared/lib/api/home-data';
import type { Playlist } from '@/types';

/**
 * Hook to fetch home banners
 * Stale time: 10 minutes
 */
export function useBanners() {
  return useQuery({
    queryKey: queryKeys.home.banners(),
    queryFn: () => homeClient.getBanners(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch featured videos
 * Stale time: 10 minutes
 */
export function useFeaturedVideos() {
  return useQuery({
    queryKey: queryKeys.home.featured(),
    queryFn: () => homeClient.getFeaturedVideos(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch recommended videos
 * Stale time: 10 minutes
 */
export function useRecommendedVideos() {
  return useQuery({
    queryKey: queryKeys.home.recommended(),
    queryFn: () => homeClient.getRecommendedVideos(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch short videos
 * Stale time: 10 minutes
 */
export function useShortVideos() {
  return useQuery({
    queryKey: queryKeys.home.shorts(),
    queryFn: () => homeClient.getShortVideosV2(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch series
 * Stale time: 10 minutes
 */
export function useSeries() {
  return useQuery({
    queryKey: queryKeys.home.series(),
    queryFn: () => homeClient.getSeries(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch courses
 * Stale time: 10 minutes
 */
export function useCourses() {
  return useQuery({
    queryKey: queryKeys.home.courses(),
    queryFn: () => homeClient.getCourses(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch creators
 * Stale time: 10 minutes
 */
export function useCreators() {
  return useQuery({
    queryKey: queryKeys.home.creators(),
    queryFn: () => homeClient.getCreators(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Fetch playlists from the API route
 */
async function fetchHomePlaylists(cursor: number | null): Promise<HomePageData> {
  const url = cursor ? `/api/home/playlists?cursor=${cursor}` : '/api/home/playlists?cursor=1';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch playlists');
  }
  return response.json();
}

export interface HomePlaylistsInfiniteOptions {
  initialPlaylists?: Playlist[];
  initialCursor?: number | null;
  isInitialLastPage?: boolean;
}

/**
 * Hook to fetch home playlists with infinite scroll
 *
 * Uses cursor-based pagination via the /api/home/playlists route
 * Stale time: 10 minutes
 * GC time: 30 minutes
 */
export function useHomePlaylistsInfinite(options: HomePlaylistsInfiniteOptions = {}) {
  const { initialPlaylists, initialCursor, isInitialLastPage } = options;

  return useInfiniteQuery({
    queryKey: queryKeys.home.playlists(),
    queryFn: ({ pageParam }) => fetchHomePlaylists(pageParam),
    getNextPageParam: (lastPage) => (lastPage.isLastPage ? undefined : lastPage.nextCursor),
    initialPageParam: 1 as number | null,
    ...(initialPlaylists && initialPlaylists.length > 0
      ? {
          initialData: {
            pages: [
              {
                playlists: initialPlaylists,
                nextCursor: initialCursor ?? null,
                isLastPage: isInitialLastPage ?? false,
                static: null,
              } as HomePageData,
            ],
            pageParams: [1 as number | null],
          },
        }
      : {}),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}
