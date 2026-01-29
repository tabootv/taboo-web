/**
 * useShortsFeed Hook
 *
 * Manages shorts feed data fetching with deep link support.
 * Combines initial short (from URL UUID) with infinite feed list.
 *
 * Key features:
 * - Fetches specific short when deep linking to /shorts/[uuid]
 * - Merges initial short with paginated feed
 * - Deduplicates videos in the merged list
 * - Supports infinite scroll via fetchNextPage
 * - Seeds detail query cache for reactive updates
 */

import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback, useEffect } from 'react';
import { shortsClient } from '@/api/client/shorts.client';
import { queryKeys } from '@/api/query-keys';
import type { ShortVideo, PaginatedResponse } from '@/api/types';

interface UseShortsFeedOptions {
  /**
   * UUID from URL for deep linking.
   * When provided, this short will be fetched first and positioned at the start.
   */
  initialUuid?: string;
  /**
   * Number of items per page for infinite scroll
   * @default 10
   */
  perPage?: number;
}

interface UseShortsFeedReturn {
  /** Merged list of shorts (initial + feed) */
  shorts: ShortVideo[];
  /** Index of the initial short in the merged list */
  initialIndex: number;
  /** Whether initial data is loading */
  isLoading: boolean;
  /** Whether initial short is loading (when deep linking) */
  isLoadingInitial: boolean;
  /** Whether feed list is loading */
  isLoadingFeed: boolean;
  /** Whether there are more pages to load */
  hasNextPage: boolean;
  /** Whether fetching next page */
  isFetchingNextPage: boolean;
  /** Error from either query */
  error: Error | null;
  /** Error from initial short query (for deep link failures) */
  initialError: Error | null;
  /** Fetch next page of shorts */
  fetchNextPage: () => void;
  /** Refetch all data */
  refetch: () => void;
  /** Whether we have any data loaded */
  hasFetched: boolean;
}

/**
 * Hook to manage shorts feed with deep link support
 */
export function useShortsFeed(options: UseShortsFeedOptions = {}): UseShortsFeedReturn {
  const { initialUuid, perPage = 10 } = options;
  const queryClient = useQueryClient();

  // Fetch initial short when deep linking
  const {
    data: initialShort,
    isLoading: isLoadingInitial,
    error: initialError,
    isSuccess: initialSuccess,
    isFetched: initialFetched,
  } = useQuery({
    queryKey: queryKeys.shorts.detail(initialUuid || ''),
    queryFn: async () => {
      if (!initialUuid) {
        throw new Error('Initial UUID is required');
      }
      const result = await shortsClient.get(initialUuid);
      if (result === null || result === undefined) {
        throw new Error(`Short with UUID ${initialUuid} not found`);
      }
      return result;
    },
    enabled: !!initialUuid,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  // Fetch paginated feed
  // Start immediately if no initialUuid, or wait for initial to succeed
  // If initial fails, we still load the feed so user can browse other shorts
  const feedEnabled = !initialUuid || initialFetched;

  const {
    data: feedPages,
    isLoading: isLoadingFeed,
    error: feedError,
    hasNextPage = false,
    isFetchingNextPage,
    fetchNextPage: fetchNextPageRaw,
    refetch: refetchFeed,
    isFetched: feedFetched,
  } = useInfiniteQuery({
    queryKey: queryKeys.shorts.list({ per_page: perPage }),
    queryFn: ({ pageParam = 1 }) => shortsClient.list({ page: pageParam, per_page: perPage }),
    getNextPageParam: (lastPage: PaginatedResponse<ShortVideo>) =>
      lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    enabled: feedEnabled,
  });

  // Merge initial short with feed, deduplicating
  const { shorts, initialIndex } = useMemo(() => {
    const feedShorts = feedPages?.pages.flatMap((p) => p.data) ?? [];

    // Only include initial short if it was successfully fetched
    if (initialShort && initialSuccess) {
      // Check if initial short is already in the feed
      const existingIndex = feedShorts.findIndex((s) => s.uuid === initialShort.uuid);

      if (existingIndex === -1) {
        // Initial short not in feed - prepend it
        return {
          shorts: [initialShort as ShortVideo, ...feedShorts],
          initialIndex: 0,
        };
      } else if (existingIndex === 0) {
        // Initial short is already first - use feed as-is
        return {
          shorts: feedShorts,
          initialIndex: 0,
        };
      } else {
        // Initial short is in feed but not first - reorder
        // Remove from current position and prepend
        const reordered = [
          initialShort as ShortVideo,
          ...feedShorts.filter((s) => s.uuid !== initialShort.uuid),
        ];
        return {
          shorts: reordered,
          initialIndex: 0,
        };
      }
    }

    // No initial short or initial failed - just use feed
    return {
      shorts: feedShorts,
      initialIndex: 0,
    };
  }, [feedPages, initialShort, initialSuccess]);

  // Seed detail query cache for each short to enable reactive updates
  useEffect(() => {
    shorts.forEach((short) => {
      queryClient.setQueryData(queryKeys.shorts.detail(short.uuid), short);
    });
  }, [shorts, queryClient]);

  // Wrapper for fetchNextPage that handles edge cases
  const fetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPageRaw();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPageRaw]);

  // Refetch all data
  const refetch = useCallback(() => {
    if (initialUuid) {
      queryClient.invalidateQueries({ queryKey: queryKeys.shorts.detail(initialUuid) });
    }
    refetchFeed();
  }, [initialUuid, refetchFeed, queryClient]);

  // Combined loading state - loading if either is loading initially
  const isLoading = isLoadingInitial || (isLoadingFeed && !feedFetched);

  // Combined error
  const error = (initialError as Error | null) || (feedError as Error | null);

  // Has fetched - true when we have data
  const hasFetched = feedFetched || (!!initialUuid && initialFetched);

  return {
    shorts,
    initialIndex,
    isLoading,
    isLoadingInitial,
    isLoadingFeed,
    hasNextPage,
    isFetchingNextPage,
    error,
    initialError: initialError as Error | null,
    fetchNextPage,
    refetch,
    hasFetched,
  };
}
