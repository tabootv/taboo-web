/**
 * Comments Mutation Hooks
 *
 * TanStack Query mutation hooks for comment actions
 * with optimistic updates and cache invalidation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsClient } from '../client/comments.client';
import { queryKeys } from '../query-keys';
import type { Comment } from '../types';

/**
 * Hook to toggle like on a comment with optimistic update
 */
export function useToggleCommentLike(
  videoId?: string | number,
  shortId?: string,
  postId?: string | number
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentUuid: string) => commentsClient.toggleLike(commentUuid),
    onMutate: async (commentUuid) => {
      // Determine which comments list to update
      const queryKey = videoId
        ? queryKeys.videos.comments(videoId)
        : shortId
          ? queryKeys.shorts.comments(shortId)
          : postId
            ? queryKeys.community.comments(postId)
            : null;

      if (queryKey) {
        await queryClient.cancelQueries({ queryKey });

        const previous = queryClient.getQueryData(queryKey);

        // Optimistically update the comment in the list
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;

          const updateComment = (comment: Comment): Comment => {
            if (comment.uuid === commentUuid) {
              return {
                ...comment,
                has_liked: !comment.has_liked,
                likes_count: comment.has_liked ? comment.likes_count - 1 : comment.likes_count + 1,
              };
            }
            // Also check nested replies
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: comment.replies.map(updateComment),
              };
            }
            return comment;
          };

          // Handle paginated response
          if (old.data && Array.isArray(old.data)) {
            return {
              ...old,
              data: old.data.map(updateComment),
            };
          }

          // Handle array response
          if (Array.isArray(old)) {
            return old.map(updateComment);
          }

          return old;
        });

        return { previous, queryKey };
      }

      return { previous: null, queryKey: null };
    },
    onError: (_err, _commentUuid, context) => {
      if (context?.previous && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: (_data, _error, _commentUuid, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}

/**
 * Hook to toggle dislike on a comment with optimistic update
 */
export function useToggleCommentDislike(
  videoId?: string | number,
  shortId?: string,
  postId?: string | number
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentUuid: string) => commentsClient.toggleDislike(commentUuid),
    onMutate: async (commentUuid) => {
      // Determine which comments list to update
      const queryKey = videoId
        ? queryKeys.videos.comments(videoId)
        : shortId
          ? queryKeys.shorts.comments(shortId)
          : postId
            ? queryKeys.community.comments(postId)
            : null;

      if (queryKey) {
        await queryClient.cancelQueries({ queryKey });

        const previous = queryClient.getQueryData(queryKey);

        // Optimistically update the comment in the list
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;

          const updateComment = (comment: Comment): Comment => {
            if (comment.uuid === commentUuid) {
              const currentDisliked = comment.has_disliked ?? false;
              return {
                ...comment,
                has_disliked: !currentDisliked,
                dislikes_count: currentDisliked
                  ? (comment.dislikes_count || 0) - 1
                  : (comment.dislikes_count || 0) + 1,
              };
            }
            // Also check nested replies
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: comment.replies.map(updateComment),
              };
            }
            return comment;
          };

          // Handle paginated response
          if (old.data && Array.isArray(old.data)) {
            return {
              ...old,
              data: old.data.map(updateComment),
            };
          }

          // Handle array response
          if (Array.isArray(old)) {
            return old.map(updateComment);
          }

          return old;
        });

        return { previous, queryKey };
      }

      return { previous: null, queryKey: null };
    },
    onError: (_err, _commentUuid, context) => {
      if (context?.previous && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: (_data, _error, _commentUuid, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}

/**
 * Hook to delete a comment
 */
export function useDeleteComment(
  videoId?: string | number,
  shortId?: string,
  postId?: string | number
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentUuid: string) => commentsClient.delete(commentUuid),
    onSuccess: (_data, _commentUuid) => {
      // Invalidate the appropriate comments list
      if (videoId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.videos.comments(videoId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.videos.detail(videoId) });
      }
      if (shortId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.shorts.comments(shortId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.shorts.detail(shortId) });
      }
      if (postId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.community.comments(postId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.community.postDetail(postId) });
      }
    },
  });
}
