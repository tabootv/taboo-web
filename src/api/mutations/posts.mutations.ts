/**
 * Community Posts Mutation Hooks
 *
 * TanStack Query mutation hooks for post actions
 * with optimistic updates and cache invalidation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsClient } from '../client';
import { queryKeys } from '../query-keys';
import type { Post } from '../types';

/**
 * Hook to create a new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caption, image }: { caption: string; image?: File }) =>
      postsClient.create(caption, image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.postList() });
    },
  });
}

/**
 * Hook to like a post with optimistic update
 */
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postsClient.like(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.community.postDetail(postId) });

      const previous = queryClient.getQueryData<Post>(queryKeys.community.postDetail(postId));

      if (previous) {
        queryClient.setQueryData<Post>(queryKeys.community.postDetail(postId), {
          ...previous,
          has_liked: !previous.has_liked,
          likes_count: previous.has_liked ? previous.likes_count - 1 : previous.likes_count + 1,
        });
      }

      return { previous };
    },
    onError: (_err, postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.community.postDetail(postId), context.previous);
      }
    },
    onSettled: (_data, _error, postId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.postDetail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.community.postList() });
    },
  });
}

/**
 * Hook to dislike a post with optimistic update
 */
export function useDislikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postsClient.dislike(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.community.postDetail(postId) });

      const previous = queryClient.getQueryData<Post>(queryKeys.community.postDetail(postId));

      if (previous) {
        queryClient.setQueryData<Post>(queryKeys.community.postDetail(postId), {
          ...previous,
          has_disliked: !previous.has_disliked,
          dislikes_count: previous.has_disliked
            ? previous.dislikes_count - 1
            : previous.dislikes_count + 1,
        });
      }

      return { previous };
    },
    onError: (_err, postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.community.postDetail(postId), context.previous);
      }
    },
    onSettled: (_data, _error, postId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.postDetail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.community.postList() });
    },
  });
}

/**
 * Hook to delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postsClient.delete(postId),
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.postList() });
      queryClient.removeQueries({ queryKey: queryKeys.community.postDetail(postId) });
    },
  });
}

export function useAddPostComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      content,
      parentId,
    }: {
      postId: number;
      content: string;
      parentId?: number;
    }) => postsClient.addComment(postId, content, parentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.comments(variables.postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.community.postDetail(variables.postId) });
    },
  });
}
