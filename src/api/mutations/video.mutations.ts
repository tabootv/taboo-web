/**
 * Video Mutation Hooks
 *
 * TanStack Query mutation hooks for video actions
 * with optimistic updates and cache invalidation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { videoClient } from '../client';
import { queryKeys } from '../query-keys';
import type { Video } from '../types';

/**
 * Hook to toggle like on a video with optimistic update
 */
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: string | number) => videoClient.toggleLike(videoId),
    onMutate: async (videoId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.videos.detail(videoId) });

      const previous = queryClient.getQueryData<Video>(queryKeys.videos.detail(videoId));

      if (previous) {
        queryClient.setQueryData<Video>(queryKeys.videos.detail(videoId), {
          ...previous,
          has_liked: !previous.has_liked,
          likes_count: previous.has_liked ? previous.likes_count - 1 : previous.likes_count + 1,
        });
      }

      return { previous };
    },
    onError: (_err, videoId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.videos.detail(videoId), context.previous);
      }
    },
    onSettled: (_data, _error, videoId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.detail(videoId) });
    },
  });
}

/**
 * Hook to toggle dislike on a video with optimistic update
 */
export function useToggleDislike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: string | number) => videoClient.toggleDislike(videoId),
    onMutate: async (videoId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.videos.detail(videoId) });

      const previous = queryClient.getQueryData<Video>(queryKeys.videos.detail(videoId));

      if (previous) {
        queryClient.setQueryData<Video>(queryKeys.videos.detail(videoId), {
          ...previous,
          has_disliked: !previous.has_disliked,
          dislikes_count: previous.has_disliked
            ? (previous.dislikes_count || 0) - 1
            : (previous.dislikes_count || 0) + 1,
        });
      }

      return { previous };
    },
    onError: (_err, videoId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.videos.detail(videoId), context.previous);
      }
    },
    onSettled: (_data, _error, videoId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.detail(videoId) });
    },
  });
}

/**
 * Hook to toggle bookmark on a video with optimistic update
 */
export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: string | number) => videoClient.toggleBookmark(videoId),
    onMutate: async (videoId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.videos.detail(videoId) });

      const previous = queryClient.getQueryData<Video>(queryKeys.videos.detail(videoId));

      if (previous) {
        queryClient.setQueryData<Video>(queryKeys.videos.detail(videoId), {
          ...previous,
          is_bookmarked: !previous.is_bookmarked,
        });
      }

      return { previous };
    },
    onError: (_err, videoId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.videos.detail(videoId), context.previous);
      }
    },
    onSettled: (_data, _error, videoId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.detail(videoId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.bookmarked() });
    },
  });
}

/**
 * Hook to add a comment to a video
 */
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      videoId,
      content,
      parentId,
    }: {
      videoId: string | number;
      content: string;
      parentId?: number;
    }) => videoClient.addComment(videoId, content, parentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.comments(variables.videoId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.detail(variables.videoId) });
    },
  });
}

/**
 * Hook to toggle autoplay preference
 */
export function useToggleAutoplay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => videoClient.toggleAutoplay(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}
