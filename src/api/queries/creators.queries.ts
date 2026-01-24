/**
 * Creators Query Hooks
 *
 * TanStack Query hooks for creator-related data fetching
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { CreatorListFilters } from '../client/creators.client';
import { creatorsClient } from '../client/creators.client';
import { queryKeys } from '../query-keys';
import type { Creator } from '../types';

/**
 * Hook to fetch list of creators (requires auth)
 */
export function useCreatorsList(filters?: CreatorListFilters) {
  return useQuery({
    queryKey: queryKeys.creators.list(filters),
    queryFn: () => creatorsClient.list(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch public creators list (no auth required)
 */
export function useCreatorsListPublic(filters?: CreatorListFilters) {
  return useQuery({
    queryKey: [...queryKeys.creators.list(filters), 'public'],
    queryFn: () => creatorsClient.listPublic(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch creator profile
 * Stale time: 30 minutes (creator profile rarely changes)
 */
export function useCreatorProfile(id: string | number | null | undefined) {
  return useQuery({
    queryKey: queryKeys.creators.detail(id!),
    queryFn: () => creatorsClient.getProfile(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch creator videos
 */
export function useCreatorVideos(
  id: string | number | null | undefined,
  params?: { sort_by?: string; page_url?: string }
) {
  return useQuery({
    queryKey: [...queryKeys.creators.videos(id!), params],
    queryFn: () => creatorsClient.getVideos(id!, params),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch creator shorts
 */
export function useCreatorShorts(
  id: string | number | null | undefined,
  params?: { sort_by?: string; page_url?: string }
) {
  return useQuery({
    queryKey: [...queryKeys.creators.shorts(id!), params],
    queryFn: () => creatorsClient.getShorts(id!, params),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch creator series
 */
export function useCreatorSeries(
  id: string | number | null | undefined,
  params?: { sort_by?: string; page_url?: string }
) {
  return useQuery({
    queryKey: [...queryKeys.creators.series(id!), params],
    queryFn: () => creatorsClient.getSeries(id!, params),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch creator posts
 */
export function useCreatorPosts(
  id: string | number | null | undefined,
  params?: { sort_by?: string; page_url?: string }
) {
  return useQuery({
    queryKey: [...queryKeys.creators.posts(id!), params],
    queryFn: () => creatorsClient.getPosts(id!, params),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch creator courses
 */
export function useCreatorCourses(
  id: string | number | null | undefined,
  params?: { sort_by?: string; page_url?: string }
) {
  return useQuery({
    queryKey: [...queryKeys.creators.courses(id!), params],
    queryFn: () => creatorsClient.getCourses(id!, params),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch creator by handler
 */
export function useCreatorByHandler(
  handler: string,
  options?: { staleTime?: number; refetchOnWindowFocus?: boolean }
) {
  return useQuery<{ creators: Creator[] }>({
    queryKey: [...queryKeys.creators.list({ handler }), 'by-handler'],
    queryFn: async () => {
      const response = await creatorsClient.listPublic({ handler });
      return { creators: response.data || response.creators || [] };
    },
    enabled: !!handler,
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutes default
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
}

// ============================================================================
// Infinite Query Hooks for Creator Content Tabs
// ============================================================================

/**
 * Hook to fetch creator videos with infinite scroll
 */
export function useCreatorVideosInfinite(
  creatorId: string | number | null | undefined,
  filters?: { sort_by?: string }
) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.creators.videos(creatorId!), 'infinite', filters],
    queryFn: async ({ pageParam }) => {
      const params = pageParam ? { page_url: pageParam, ...filters } : filters;
      return creatorsClient.getVideos(creatorId!, params);
    },
    getNextPageParam: (lastPage) => lastPage.next_page_url || undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!creatorId,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Hook to fetch creator shorts with infinite scroll
 */
export function useCreatorShortsInfinite(
  creatorId: string | number | null | undefined,
  filters?: { sort_by?: string }
) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.creators.shorts(creatorId!), 'infinite', filters],
    queryFn: async ({ pageParam }) => {
      const params = pageParam ? { page_url: pageParam, ...filters } : filters;
      return creatorsClient.getShorts(creatorId!, params);
    },
    getNextPageParam: (lastPage) => lastPage.next_page_url || undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!creatorId,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Hook to fetch creator series with infinite scroll
 */
export function useCreatorSeriesInfinite(
  creatorId: string | number | null | undefined,
  filters?: { sort_by?: string }
) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.creators.series(creatorId!), 'infinite', filters],
    queryFn: async ({ pageParam }) => {
      const params = pageParam ? { page_url: pageParam, ...filters } : filters;
      return creatorsClient.getSeries(creatorId!, params);
    },
    getNextPageParam: (lastPage) => lastPage.next_page_url || undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!creatorId,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Hook to fetch creator posts with infinite scroll
 */
export function useCreatorPostsInfinite(
  creatorId: string | number | null | undefined,
  filters?: { sort_by?: string }
) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.creators.posts(creatorId!), 'infinite', filters],
    queryFn: async ({ pageParam }) => {
      const params = pageParam ? { page_url: pageParam, ...filters } : filters;
      return creatorsClient.getPosts(creatorId!, params);
    },
    getNextPageParam: (lastPage) => lastPage.next_page_url || undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!creatorId,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Hook to fetch creator courses (Education tab) with infinite scroll
 */
export function useCreatorCoursesInfinite(
  creatorId: string | number | null | undefined,
  filters?: { sort_by?: string }
) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.creators.courses(creatorId!), 'infinite', filters],
    queryFn: async ({ pageParam }) => {
      const params = pageParam ? { page_url: pageParam, ...filters } : filters;
      return creatorsClient.getCourses(creatorId!, params);
    },
    getNextPageParam: (lastPage) => lastPage.next_page_url || undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!creatorId,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

