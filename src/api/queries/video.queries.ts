/**
 * Video Query Hooks
 *
 * TanStack Query hooks for video-related data fetching
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { VideoListFilters } from '../client';
import { videoClient } from '../client';
import { queryKeys } from '../query-keys';

/**
 * Hook to fetch a single video by ID or UUID
 *
 * Stale time: 30 minutes (video metadata rarely changes)
 */
export function useVideo(id: string | number | null | undefined) {
  return useQuery({
    queryKey: queryKeys.videos.detail(id!),
    queryFn: () => videoClient.get(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch list of videos with infinite scroll
 *
 * Stale time: 10 minutes
 */
export function useVideoList(filters?: VideoListFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.videos.list(filters as Record<string, unknown>),
    queryFn: ({ pageParam = 1 }) => videoClient.list({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch long-form videos only (excludes shorts)
 */
export function useLongFormVideos(page = 1, perPage = 24) {
  return useQuery({
    queryKey: queryKeys.videos.list({ page, per_page: perPage, short: false }),
    queryFn: () => videoClient.getLongForm(page, perPage),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch related videos for a video
 */
export function useRelatedVideos(
  videoId: string | number | null | undefined,
  page = 1,
  perPage = 12
) {
  return useQuery({
    queryKey: queryKeys.videos.related(videoId!),
    queryFn: () => videoClient.getRelated(videoId!, page, perPage),
    enabled: !!videoId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch comments for a video
 */
export function useVideoComments(id: string | number | null | undefined, page = 1) {
  return useQuery({
    queryKey: [...queryKeys.videos.comments(id!), page],
    queryFn: () => videoClient.getComments(id!, page),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
