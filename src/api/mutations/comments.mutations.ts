/**
 * Comments Mutation Hooks
 *
 * TanStack Query mutation hooks for comment actions
 * with optimistic updates and cache invalidation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsClient } from '../client/comments.client';
import { postsClient } from '../client/posts.client';
import { videoClient } from '../client/video.client';
import { queryKeys } from '../query-keys';
import type { Comment, User } from '../types';

/**
 * Create an optimistic comment object
 */
function createOptimisticComment(content: string, user: User, parentId?: number): Comment {
  const tempId = Date.now();
  const base = {
    id: tempId,
    uuid: `temp-${tempId}`,
    content,
    user,
    likes_count: 0,
    dislikes_count: 0,
    has_liked: false,
    has_disliked: false,
    replies_count: 0,
    replies: [],
    created_at: 'Just now',
    updated_at: new Date().toISOString(),
    _optimistic: true,
  };
  // Only include parent_id if defined (exactOptionalPropertyTypes)
  return parentId !== undefined ? { ...base, parent_id: parentId } : base;
}

/**
 * Recursively find a comment by ID in the comments tree and add a reply to it
 */
function addReplyToComment(comments: Comment[], parentId: number, reply: Comment): Comment[] {
  return comments.map((comment) => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...(comment.replies || []), reply],
        replies_count: (comment.replies_count || 0) + 1,
      };
    }
    // Recursively search in nested replies
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: addReplyToComment(comment.replies, parentId, reply),
      };
    }
    return comment;
  });
}

interface AddCommentParams {
  content: string;
  parentId?: number;
  user: User;
}

/**
 * Hook to add a comment with optimistic update
 * Supports videos, shorts, and community posts
 */
export function useAddComment(
  videoId?: string | number,
  shortId?: string,
  postId?: string | number
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, parentId }: AddCommentParams) => {
      if (videoId) {
        return videoClient.addComment(videoId, content, parentId);
      }
      if (shortId) {
        // Shorts use the video endpoint for comments
        return videoClient.addComment(shortId, content, parentId);
      }
      if (postId) {
        return postsClient.addComment(Number(postId), content, parentId);
      }
      throw new Error('No content ID provided for comment');
    },
    onMutate: async ({ content, parentId, user }) => {
      // Determine which comments list to update
      const queryKey = videoId
        ? queryKeys.videos.comments(videoId)
        : shortId
          ? queryKeys.shorts.comments(shortId)
          : postId
            ? queryKeys.community.comments(postId)
            : null;

      if (!queryKey) {
        return { previous: null, queryKey: null, optimisticComment: null };
      }

      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData(queryKey);
      const optimisticComment = createOptimisticComment(content, user, parentId);

      // Optimistically add the comment to the cache
      queryClient.setQueryData(queryKey, (old: unknown) => {
        if (!old) return old;

        const oldData = old as { data?: Comment[] } | Comment[];

        // Handle reply (add to parent's replies array)
        if (parentId) {
          if ('data' in oldData && Array.isArray(oldData.data)) {
            return {
              ...oldData,
              data: addReplyToComment(oldData.data, parentId, optimisticComment),
            };
          }
          if (Array.isArray(oldData)) {
            return addReplyToComment(oldData, parentId, optimisticComment);
          }
          return old;
        }

        // Handle top-level comment (prepend to list)
        if ('data' in oldData && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: [optimisticComment, ...oldData.data],
          };
        }
        if (Array.isArray(oldData)) {
          return [optimisticComment, ...oldData];
        }
        return old;
      });

      return { previous, queryKey, optimisticComment };
    },
    onError: (_err, _variables, context) => {
      // Rollback to previous state on error
      if (context?.previous && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: () => {
      // Invalidate to sync with server
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
 * Hook to delete a comment with optimistic update
 */
export function useDeleteComment(
  videoId?: string | number,
  shortId?: string,
  postId?: string | number
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentUuid: string) => commentsClient.delete(commentUuid),
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

        // Optimistically remove the comment from the list
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;

          const removeComment = (comments: Comment[]): Comment[] =>
            comments
              .filter((c) => c.uuid !== commentUuid)
              .map((c) => ({
                ...c,
                replies: c.replies ? removeComment(c.replies) : [],
              }));

          // Handle paginated response
          if (old.data && Array.isArray(old.data)) {
            return {
              ...old,
              data: removeComment(old.data),
            };
          }

          // Handle array response
          if (Array.isArray(old)) {
            return removeComment(old);
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
    onSettled: () => {
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
