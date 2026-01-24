/**
 * Shorts Mutation Hooks
 *
 * TanStack Query mutation hooks for shorts actions
 * with optimistic updates and cache invalidation
 */

import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { shortsClient } from '../client/shorts.client';
import { queryKeys } from '../query-keys';
import type { ShortVideo, PaginatedResponse } from '../types';

type InfiniteShortsData = InfiniteData<PaginatedResponse<ShortVideo>>;

interface ToggleLikeContext {
  previousDetail: ShortVideo | undefined;
  previousLists: [readonly unknown[], InfiniteShortsData | undefined][];
}

/**
 * Hook to toggle like on a short with optimistic update
 *
 * Updates both detail query and infinite list queries for immediate UI feedback
 */
export function useToggleShortLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => shortsClient.toggleLike(uuid),
    onMutate: async (uuid): Promise<ToggleLikeContext> => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.shorts.detail(uuid) });
      await queryClient.cancelQueries({ queryKey: queryKeys.shorts.lists() });

      // Snapshot previous detail value
      const previousDetail = queryClient.getQueryData<ShortVideo>(
        queryKeys.shorts.detail(uuid)
      );

      // Snapshot previous list values (all infinite queries matching shorts.lists())
      const previousLists = queryClient.getQueriesData<InfiniteShortsData>({
        queryKey: queryKeys.shorts.lists(),
      });

      // Helper to toggle like state
      const toggleLikeState = (short: ShortVideo): ShortVideo => ({
        ...short,
        has_liked: !short.has_liked,
        likes_count: short.has_liked ? short.likes_count - 1 : short.likes_count + 1,
      });

      // Optimistic update for detail query
      if (previousDetail) {
        queryClient.setQueryData<ShortVideo>(
          queryKeys.shorts.detail(uuid),
          toggleLikeState(previousDetail)
        );
      }

      // Optimistic update for all infinite list queries
      previousLists.forEach(([key, data]) => {
        if (data) {
          queryClient.setQueryData<InfiniteShortsData>(key, {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              data: page.data.map((short) =>
                short.uuid === uuid ? toggleLikeState(short) : short
              ),
            })),
          });
        }
      });

      return { previousDetail, previousLists };
    },
    onError: (_err, uuid, context) => {
      // Rollback detail query
      if (context?.previousDetail) {
        queryClient.setQueryData(queryKeys.shorts.detail(uuid), context.previousDetail);
      }

      // Rollback all list queries
      context?.previousLists.forEach(([key, data]) => {
        if (data) {
          queryClient.setQueryData(key, data);
        }
      });
    },
    onSettled: (_data, _error, uuid) => {
      // Only invalidate detail query to refresh from server
      // Don't invalidate lists to preserve infinite scroll position
      queryClient.invalidateQueries({ queryKey: queryKeys.shorts.detail(uuid) });
    },
  });
}

/**
 * Hook to toggle bookmark on a short with optimistic update
 */
export function useToggleShortBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => shortsClient.toggleBookmark(uuid),
    onMutate: async (uuid) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.shorts.detail(uuid) });

      const previous = queryClient.getQueryData<ShortVideo>(queryKeys.shorts.detail(uuid));

      if (previous) {
        const currentBookmarked = previous.is_bookmarked ?? false;
        queryClient.setQueryData<ShortVideo>(queryKeys.shorts.detail(uuid), {
          ...previous,
          is_bookmarked: !currentBookmarked,
        });
      }

      return { previous };
    },
    onError: (_err, uuid, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.shorts.detail(uuid), context.previous);
      }
    },
    onSettled: (_data, _error, uuid) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shorts.detail(uuid) });
    },
  });
}
