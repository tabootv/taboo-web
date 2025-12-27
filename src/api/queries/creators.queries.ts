/**
 * Creators Query Hooks
 *
 * TanStack Query hooks for creator-related data fetching
 */

import { useQuery } from '@tanstack/react-query';
import type { CreatorListFilters } from '../client';
import { creatorsClient } from '../client';
import { queryKeys } from '../query-keys';

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

