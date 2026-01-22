/**
 * Video Query Hooks
 *
 * TanStack Query hooks for video-related data fetching
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { VideoListFilters } from '../client';
import { videoClient } from '../client';
import { queryKeys } from '../query-keys';
import type { Video } from '../types';

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
 * Hook to play video (returns video + related videos)
 */
export function useVideoPlay(id: string | number | null | undefined) {
  return useQuery({
    queryKey: [...queryKeys.videos.detail(id!), 'play'],
    queryFn: () => videoClient.play(id!),
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

/**
 * Hook to fetch bookmarked videos
 */
export function useBookmarkedVideos(page = 1, perPage = 12, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...queryKeys.videos.bookmarked(), page, perPage],
    queryFn: () => videoClient.getBookmarked(page, perPage),
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...(options?.enabled !== undefined && { enabled: options.enabled }),
  });
}

/**
 * Hook to fetch watch history
 */
export function useHistoryVideos(page = 1, perPage = 12, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...queryKeys.videos.history(), page, perPage],
    queryFn: () => videoClient.getHistory(page, perPage),
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...(options?.enabled !== undefined && { enabled: options.enabled }),
  });
}

/**
 * Hook to fetch liked videos
 */
export function useLikedVideos(page = 1, perPage = 12) {
  return useQuery({
    queryKey: [...queryKeys.videos.liked(), page, perPage],
    queryFn: () => videoClient.getLiked(page, perPage),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch videos with filters (simplified for creator pages)
 * Returns videos array directly instead of paginated response
 */
export function useVideos(
  filters?: { creators?: string; short?: boolean; sort_by?: string; per_page?: number },
  options?: { enabled?: boolean; staleTime?: number; refetchOnWindowFocus?: boolean }
) {
  return useQuery<{ videos: Video[] }>({
    queryKey: queryKeys.videos.list({
      ...filters,
      channel_id: filters?.creators ? Number(filters.creators) : undefined,
    }),
    queryFn: async () => {
      const listFilters: Parameters<typeof videoClient.list>[0] = {
        short: filters?.short ?? false,
        per_page: filters?.per_page ?? 60,
      };

      if (filters?.creators) {
        listFilters.channel_id = Number(filters.creators);
      }

      if (filters?.sort_by) {
        listFilters.sort_by = filters.sort_by === 'latest'
          ? 'newest'
          : (filters.sort_by as 'trending' | 'newest' | 'oldest' | 'longest' | 'shortest');
      }

      const response = await videoClient.list(listFilters);
      return { videos: response.data || [] };
    },
    enabled: options?.enabled !== undefined ? options.enabled : true,
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutes default
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
}
