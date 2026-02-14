/**
 * Creators Mutation Hooks
 *
 * TanStack Query mutation hooks for creator operations
 */

import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { creatorsClient } from '../client/creators.client';
import type { CreatorListResponse, FollowResponse } from '../client/creators.client';
import { queryKeys } from '../query-keys';
import type { Creator, Post } from '../types';
import type { PaginatedResponse } from '@/types/api';

interface ToggleFollowContext {
  previousLists: [readonly unknown[], CreatorListResponse | undefined][];
  previousDetail: Creator | undefined;
  previousPostDetails: [readonly unknown[], Post | undefined][];
  previousPostLists: [readonly unknown[], InfiniteData<PaginatedResponse<Post>> | undefined][];
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

      // Cancel & snapshot post queries
      await queryClient.cancelQueries({ queryKey: queryKeys.community.posts() });

      const previousPostDetails = queryClient.getQueriesData<Post>({
        queryKey: queryKeys.community.posts(),
      });

      const previousPostLists = queryClient.getQueriesData<InfiniteData<PaginatedResponse<Post>>>({
        queryKey: queryKeys.community.postList(),
      });

      const updatePostChannel = (post: Post): Post => {
        const channelId = post.channel?.id ?? post.user?.channel?.id;
        if (channelId !== Number(creatorId)) return post;
        const existingChannel = post.channel ?? post.user?.channel;
        if (!existingChannel) return post;
        return {
          ...post,
          channel: { ...existingChannel, following: newFollowingState },
          user: post.user?.channel
            ? { ...post.user, channel: { ...post.user.channel, following: newFollowingState } }
            : post.user,
        };
      };

      // Update post detail caches
      queryClient.setQueriesData<Post>(
        { queryKey: queryKeys.community.posts(), exact: false },
        (oldData) => {
          if (!oldData || !('id' in oldData)) return oldData;
          return updatePostChannel(oldData);
        }
      );

      // Update post list (infinite query) caches
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<Post>>>(
        { queryKey: queryKeys.community.postList(), exact: false },
        (oldData) => {
          if (!oldData?.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.map(updatePostChannel),
            })),
          };
        }
      );

      return { previousLists, previousDetail, previousPostDetails, previousPostLists };
    },

    onError: (_error, { creatorId }, context) => {
      context?.previousLists.forEach(([key, data]) => {
        if (data) queryClient.setQueryData(key, data);
      });
      if (context?.previousDetail) {
        queryClient.setQueryData(queryKeys.creators.detail(creatorId), context.previousDetail);
      }
      context?.previousPostDetails.forEach(([key, data]) => {
        if (data) queryClient.setQueryData(key, data);
      });
      context?.previousPostLists.forEach(([key, data]) => {
        if (data) queryClient.setQueryData(key, data);
      });
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

      // Confirm post caches with server data
      const serverFollowing = updatedCreator.following;
      if (serverFollowing !== undefined) {
        const confirmPostChannel = (post: Post): Post => {
          const channelId = post.channel?.id ?? post.user?.channel?.id;
          if (channelId !== Number(creatorId)) return post;
          const existingChannel = post.channel ?? post.user?.channel;
          if (!existingChannel) return post;
          return {
            ...post,
            channel: { ...existingChannel, following: serverFollowing },
            user: post.user?.channel
              ? { ...post.user, channel: { ...post.user.channel, following: serverFollowing } }
              : post.user,
          };
        };

        queryClient.setQueriesData<Post>(
          { queryKey: queryKeys.community.posts(), exact: false },
          (oldData) => {
            if (!oldData || !('id' in oldData)) return oldData;
            return confirmPostChannel(oldData);
          }
        );

        queryClient.setQueriesData<InfiniteData<PaginatedResponse<Post>>>(
          { queryKey: queryKeys.community.postList(), exact: false },
          (oldData) => {
            if (!oldData?.pages) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                data: page.data.map(confirmPostChannel),
              })),
            };
          }
        );
      }
    },
    // NO onSettled invalidation - trust cache updates to avoid flicker
  });
}
