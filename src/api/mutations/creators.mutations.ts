/**
 * Creators Mutation Hooks
 *
 * TanStack Query mutation hooks for creator operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { creatorsClient } from '../client/creators.client';
import type { CreatorListResponse, FollowResponse } from '../client/creators.client';
import { queryKeys } from '../query-keys';
import type { Creator } from '../types';

interface ToggleFollowContext {
  previousLists: [readonly unknown[], CreatorListResponse | undefined][];
  previousDetail: Creator | undefined;
}

/**
 * Hook to toggle follow status for a creator
 *
 * Uses optimistic updates and server confirmation to avoid state flicker.
 * Does NOT use invalidateQueries to prevent eventual consistency issues.
 */
export function useToggleFollowCreator() {
  const queryClient = useQueryClient();

  return useMutation<
    FollowResponse,
    Error,
    { creatorId: number | string; currentFollowing: boolean },
    ToggleFollowContext
  >({
    mutationFn: ({ creatorId }) => creatorsClient.toggleFollow(creatorId),

    onMutate: async ({ creatorId, currentFollowing }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.creators.lists() });
      await queryClient.cancelQueries({ queryKey: queryKeys.creators.detail(creatorId) });

      const previousLists = queryClient.getQueriesData<CreatorListResponse>({
        queryKey: queryKeys.creators.lists(),
      });
      const previousDetail = queryClient.getQueryData<Creator>(
        queryKeys.creators.detail(creatorId)
      );

      const newFollowingState = !currentFollowing;
      queryClient.setQueriesData<CreatorListResponse>(
        { queryKey: queryKeys.creators.lists(), exact: false },
        (oldData) => {
          if (!oldData?.data) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((c) =>
              c.id === Number(creatorId) ? { ...c, following: newFollowingState } : c
            ),
          };
        }
      );

      if (previousDetail) {
        queryClient.setQueryData<Creator>(queryKeys.creators.detail(creatorId), {
          ...previousDetail,
          following: newFollowingState,
        });
      }

      return { previousLists, previousDetail };
    },

    onError: (_error, { creatorId }, context) => {
      context?.previousLists.forEach(([key, data]) => {
        if (data) queryClient.setQueryData(key, data);
      });
      if (context?.previousDetail) {
        queryClient.setQueryData(queryKeys.creators.detail(creatorId), context.previousDetail);
      }
    },

    onSuccess: (response, { creatorId }) => {
      const updatedCreator = response.creator;

      queryClient.setQueriesData<CreatorListResponse>(
        { queryKey: queryKeys.creators.lists(), exact: false },
        (oldData) => {
          if (!oldData?.data) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((c) =>
              c.id === Number(creatorId)
                ? {
                    ...c,
                    ...(updatedCreator.following !== undefined && {
                      following: updatedCreator.following,
                    }),
                    ...(updatedCreator.followers_count !== undefined && {
                      followers_count: updatedCreator.followers_count,
                    }),
                  }
                : c
            ),
          };
        }
      );

      const detailData = queryClient.getQueryData<Creator>(queryKeys.creators.detail(creatorId));
      if (detailData) {
        queryClient.setQueryData<Creator>(queryKeys.creators.detail(creatorId), {
          ...detailData,
          ...(updatedCreator.following !== undefined && { following: updatedCreator.following }),
          ...(updatedCreator.followers_count !== undefined && {
            followers_count: updatedCreator.followers_count,
          }),
        });
      }
    },
    // NO onSettled invalidation - trust cache updates to avoid flicker
  });
}
