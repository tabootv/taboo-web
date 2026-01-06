/**
 * Shorts Query Hooks
 *
 * TanStack Query hooks for shorts-related data fetching
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { ShortsListFilters } from '../client/shorts.client';
import { shortsClient } from '../client/shorts.client';
import { queryKeys } from '../query-keys';

/**
 * Hook to fetch a single short by UUID
 *
 * Stale time: 30 minutes (short metadata rarely changes)
 */
export function useShort(uuid: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.shorts.detail(uuid!),
    queryFn: () => shortsClient.get(uuid!),
    enabled: !!uuid,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch list of shorts
 *
 * Stale time: 10 minutes
 */
export function useShortsList(filters?: ShortsListFilters) {
  return useQuery({
    queryKey: queryKeys.shorts.list(filters as Record<string, unknown>),
    queryFn: () => shortsClient.list(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch list of shorts with infinite scroll
 *
 * Stale time: 10 minutes
 */
export function useShortsListInfinite(filters?: Omit<ShortsListFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: queryKeys.shorts.list(filters as Record<string, unknown>),
    queryFn: ({ pageParam = 1 }) => shortsClient.list({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch comments for a short
 *
 * Stale time: 5 minutes
 */
export function useShortComments(uuid: string | null | undefined, page = 1) {
  return useQuery({
    queryKey: [...queryKeys.shorts.comments(uuid!), page],
    queryFn: () => shortsClient.getComments(uuid!, page),
    enabled: !!uuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
