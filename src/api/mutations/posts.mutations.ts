/**
 * Community Posts Mutation Hooks
 *
 * TanStack Query mutation hooks for post actions
 * with optimistic updates and cache invalidation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsClient, type CreatePostParams } from '../client/posts.client';
import { queryKeys } from '../query-keys';
import type { Post } from '../types';

/**
 * Hook to create a new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreatePostParams) => postsClient.create(params),
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

/**
 * Hook to delete a comment on a post
 */
export function useDeletePostComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentUuid }: { commentUuid: string; postId: number }) =>
      postsClient.deleteComment(commentUuid),
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.comments(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.community.postDetail(postId) });
    },
  });
}

/**
 * Hook to like/unlike a comment on a post
 */
export function useLikePostComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: { commentId: number; postId: number }) =>
      postsClient.likeComment(commentId),
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.comments(postId) });
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
