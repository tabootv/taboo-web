/**
 * Video Mutation Hooks
 *
 * TanStack Query mutation hooks for video actions
 * with optimistic updates and cache invalidation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { videoClient } from '../client/video.client';
import { queryKeys } from '../query-keys';
import type { MeResponse, Video } from '../types';

/**
 * Hook to toggle like on a video with optimistic update
 * Updates both video detail cache and series play cache
 */
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: string | number) => videoClient.toggleLike(videoId),
    onMutate: async (videoId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.videos.detail(videoId) });
      await queryClient.cancelQueries({
        queryKey: [...queryKeys.series.detail(videoId), 'play'],
      });

      const previousVideo = queryClient.getQueryData<Video>(queryKeys.videos.detail(videoId));
      const previousSeriesPlay = queryClient.getQueryData<{ video: Video }>([
        ...queryKeys.series.detail(videoId),
        'play',
      ]);

      const currentHasLiked = previousVideo?.has_liked ?? previousSeriesPlay?.video?.has_liked;
      const newLikedState = !currentHasLiked;
      const currentLikesCount =
        previousVideo?.likes_count ?? previousSeriesPlay?.video?.likes_count ?? 0;
      const newLikesCount = newLikedState ? currentLikesCount + 1 : currentLikesCount - 1;

      if (previousVideo) {
        queryClient.setQueryData<Video>(queryKeys.videos.detail(videoId), {
          ...previousVideo,
          has_liked: newLikedState,
          likes_count: newLikesCount,
        });
      }

      if (previousSeriesPlay?.video) {
        queryClient.setQueryData<{ video: Video }>([...queryKeys.series.detail(videoId), 'play'], {
          ...previousSeriesPlay,
          video: {
            ...previousSeriesPlay.video,
            has_liked: newLikedState,
            likes_count: newLikesCount,
          },
        });
      }

      return { previousVideo, previousSeriesPlay };
    },
    onError: (_err, videoId, context) => {
      if (context?.previousVideo) {
        queryClient.setQueryData(queryKeys.videos.detail(videoId), context.previousVideo);
      }
      if (context?.previousSeriesPlay) {
        queryClient.setQueryData(
          [...queryKeys.series.detail(videoId), 'play'],
          context.previousSeriesPlay
        );
      }
    },
    onSettled: (_data, _error, videoId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.detail(videoId) });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.series.detail(videoId), 'play'],
      });
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
        const currentDisliked = previous.has_disliked ?? false;
        queryClient.setQueryData<Video>(queryKeys.videos.detail(videoId), {
          ...previous,
          has_disliked: !currentDisliked,
          dislikes_count: currentDisliked
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
        const currentBookmarked = previous.is_bookmarked ?? false;
        queryClient.setQueryData<Video>(queryKeys.videos.detail(videoId), {
          ...previous,
          is_bookmarked: !currentBookmarked,
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
 * Hook to toggle autoplay preference with optimistic update
 */
export function useToggleAutoplay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => videoClient.toggleAutoplay(),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.auth.me() });

      const previousData = queryClient.getQueryData<MeResponse>(queryKeys.auth.me());

      if (previousData?.user) {
        queryClient.setQueryData<MeResponse>(queryKeys.auth.me(), {
          ...previousData,
          user: {
            ...previousData.user,
            video_autoplay: !previousData.user.video_autoplay,
          },
        });
      }

      return { previousData };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.auth.me(), context.previousData);
      }
      toast.error('Failed to update autoplay setting');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}
