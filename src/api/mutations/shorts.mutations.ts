/**
 * Shorts Mutation Hooks
 *
 * TanStack Query mutation hooks for shorts actions
 * with optimistic updates and cache invalidation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shortsClient } from '../client/shorts.client';
import { queryKeys } from '../query-keys';
import type { ShortVideo } from '../types';

/**
 * Hook to toggle like on a short with optimistic update
 */
export function useToggleShortLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => shortsClient.toggleLike(uuid),
    onMutate: async (uuid) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.shorts.detail(uuid) });

      const previous = queryClient.getQueryData<ShortVideo>(queryKeys.shorts.detail(uuid));

      if (previous) {
        queryClient.setQueryData<ShortVideo>(queryKeys.shorts.detail(uuid), {
          ...previous,
          has_liked: !previous.has_liked,
          likes_count: previous.has_liked ? previous.likes_count - 1 : previous.likes_count + 1,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.shorts.lists() });
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
