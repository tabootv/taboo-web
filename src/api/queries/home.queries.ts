/**
 * Home Feed Query Hooks
 *
 * TanStack Query hooks for home page data fetching.
 * Hooks accept `initialData` from server components to seed the cache,
 * enabling instant repeat-visit rendering via stale-while-revalidate.
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { homeClient } from '../client/home.client';
import { queryKeys } from '../query-keys';
import type { HomePageData } from '@/shared/lib/api/home-data';
import type { Banner, Video, Series, Creator, Playlist } from '@/types';

export function useBanners(options: { initialData?: Banner[] } = {}) {
  return useQuery({
    queryKey: queryKeys.home.banners(),
    queryFn: () => homeClient.getBanners(),
    ...(options.initialData && {
      initialData: options.initialData,
      initialDataUpdatedAt: Date.now(),
    }),
  });
}

export function useFeaturedVideos(options: { initialData?: Video[] } = {}) {
  return useQuery({
    queryKey: queryKeys.home.featured(),
    queryFn: () => homeClient.getFeaturedVideos(),
    ...(options.initialData && {
      initialData: options.initialData,
      initialDataUpdatedAt: Date.now(),
    }),
  });
}

export function useRecommendedVideos(options: { initialData?: Video[] } = {}) {
  return useQuery({
    queryKey: queryKeys.home.recommended(),
    queryFn: () => homeClient.getRecommendedVideos(),
    ...(options.initialData && {
      initialData: options.initialData,
      initialDataUpdatedAt: Date.now(),
    }),
  });
}

export function useShortVideos(options: { initialData?: Video[] } = {}) {
  return useQuery({
    queryKey: queryKeys.home.shorts(),
    queryFn: () => homeClient.getShortVideosV2(),
    ...(options.initialData && {
      initialData: options.initialData,
      initialDataUpdatedAt: Date.now(),
    }),
  });
}

export function useSeries(options: { initialData?: Series[] } = {}) {
  return useQuery({
    queryKey: queryKeys.home.series(),
    queryFn: () => homeClient.getSeries(),
    ...(options.initialData && {
      initialData: options.initialData,
      initialDataUpdatedAt: Date.now(),
    }),
  });
}

export function useCourses() {
  return useQuery({
    queryKey: queryKeys.home.courses(),
    queryFn: () => homeClient.getCourses(),
  });
}

export function useCreators(options: { initialData?: Creator[] } = {}) {
  return useQuery({
    queryKey: queryKeys.home.creators(),
    queryFn: () => homeClient.getCreators(),
    ...(options.initialData && {
      initialData: options.initialData,
      initialDataUpdatedAt: Date.now(),
    }),
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
  });
}
