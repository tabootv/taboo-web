/**
 * Clips Query Hooks
 *
 * TanStack Query hooks for clips data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { clipsClient } from '../client/clips.client';

/**
 * Hook to fetch user's clips
 *
 * Stale time: 10 minutes
 */
export function useMyClips() {
  return useQuery({
    queryKey: ['clips', 'my-clips'],
    queryFn: () => clipsClient.getMyClips(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch video for clipping
 *
 * Stale time: 30 minutes
 */
export function useClippingVideo(id: number | null | undefined) {
  return useQuery({
    queryKey: ['clips', 'video', id],
    queryFn: () => clipsClient.getClippingVideo(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
