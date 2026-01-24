/**
 * Studio Query Hooks
 *
 * TanStack Query hooks for studio-related data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { studioClient } from '../client/studio.client';

/**
 * Hook to fetch studio dashboard
 */
export function useStudioDashboard() {
  return useQuery({
    queryKey: ['studio', 'dashboard'],
    queryFn: () => studioClient.getDashboard(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch creator's videos
 */
export function useStudioVideos(page = 1) {
  return useQuery({
    queryKey: ['studio', 'videos', page],
    queryFn: () => studioClient.getVideos(page),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch creator's shorts
 */
export function useStudioShorts(page = 1) {
  return useQuery({
    queryKey: ['studio', 'shorts', page],
    queryFn: () => studioClient.getShorts(page),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

