/**
 * Playlists Query Hooks
 *
 * TanStack Query hooks for playlists-related data fetching
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { PlaylistsListFilters } from '../client/playlists.client';
import { playlistsClient } from '../client/playlists.client';
import { queryKeys } from '../query-keys';

/**
 * Hook to fetch a single playlist with its videos
 *
 * Stale time: 30 minutes
 */
export function usePlaylist(id: number | null | undefined, page = 1) {
  return useQuery({
    queryKey: [...queryKeys.playlists.detail(id!), page],
    queryFn: () => playlistsClient.get(id!, page),
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch list of playlists
 *
 * Stale time: 10 minutes
 */
export function usePlaylistsList(filters?: PlaylistsListFilters) {
  return useQuery({
    queryKey: queryKeys.playlists.list(filters as Record<string, unknown>),
    queryFn: () => playlistsClient.list(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch list of playlists with infinite scroll
 *
 * Stale time: 10 minutes
 */
export function usePlaylistsListInfinite(filters?: Omit<PlaylistsListFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: queryKeys.playlists.list(filters as Record<string, unknown>),
    queryFn: ({ pageParam = 1 }) => playlistsClient.list({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}
