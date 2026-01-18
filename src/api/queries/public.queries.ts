/**
 * Public Content Query Hooks
 *
 * TanStack Query hooks for public content data fetching
 */

import { useQuery } from '@tanstack/react-query';
import type { MapVideosFilters, PublicVideosFilters } from '../client/public.client';
import { publicClient } from '../client/public.client';

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
 * Hook to fetch map videos
 *
 * Stale time: 10 minutes
 * Search requires minimum 3 characters (server-side accent-insensitive)
 */
export function useMapVideos(filters?: MapVideosFilters) {
  return useQuery({
    queryKey: ['public', 'map-videos', filters],
    queryFn: () => publicClient.getMapVideos(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !filters?.search || filters.search.length >= 3,
  });
}
