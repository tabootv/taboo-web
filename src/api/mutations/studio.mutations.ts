/**
 * Studio Mutation Hooks
 *
 * TanStack Query mutation hooks for studio operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreateSchedulePayload,
  PrepareBunnyUploadPayload,
  StudioCreatePostPayload,
  StudioUploadShortPayload,
  StudioUploadVideoPayload,
  UpdateSchedulePayload,
  UpdateVideoMetadataPayload,
  UpdateVideoPayload,
  UpdateVisibilityPayload,
} from '../types';
import { studioClient } from '../client/studio.client';

/**
 * Hook to upload a video
 */
export function useUploadVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StudioUploadVideoPayload) => studioClient.uploadVideo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio', 'videos'] });
      queryClient.invalidateQueries({ queryKey: ['studio', 'dashboard'] });
    },
  });
}

/**
 * Hook to upload a short
 */
export function useUploadShort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StudioUploadShortPayload) => studioClient.uploadShort(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio', 'shorts'] });
      queryClient.invalidateQueries({ queryKey: ['studio', 'dashboard'] });
    },
  });
}

/**
 * Hook to create a post
 */
export function useCreateStudioPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StudioCreatePostPayload) => studioClient.createPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
    },
  });
}

/**
 * Hook to delete a video
 * Uses UUID-based endpoint
 */
export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoUuid: string) => studioClient.deleteVideo(videoUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio', 'videos'] });
      queryClient.invalidateQueries({ queryKey: ['studio', 'shorts'] });
      queryClient.invalidateQueries({ queryKey: ['studio', 'dashboard'] });
    },
  });
}

/**
 * Hook to delete a short
 */
export function useDeleteShort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: number) => studioClient.deleteShort(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio', 'shorts'] });
      queryClient.invalidateQueries({ queryKey: ['studio', 'dashboard'] });
    },
  });
}

/**
 * Hook to delete a post from creator studio
 * This invalidates studio-specific queries in addition to community queries
 */
export function useDeleteStudioPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => studioClient.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio', 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['studio', 'dashboard'] });
      // Also invalidate community post list for consistency
      queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
    },
  });
}

/**
 * Hook to update video (metadata + visibility in single call)
 * Uses UUID-based endpoint
 */
export function useUpdateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoUuid, payload }: { videoUuid: string; payload: UpdateVideoPayload }) =>
      studioClient.updateVideo(videoUuid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio', 'videos'] });
      queryClient.invalidateQueries({ queryKey: ['studio', 'shorts'] });
      queryClient.invalidateQueries({ queryKey: ['studio', 'dashboard'] });
    },
  });
}

/**
 * Hook to toggle video hidden status
 */
export function useToggleVideoHidden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoUuid: string) => studioClient.toggleVideoHidden(videoUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio', 'videos'] });
    },
  });
}

/**
 * Hook to create a publish schedule (publish now or scheduled)
 */
export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoUuid, payload }: { videoUuid: string; payload: CreateSchedulePayload }) =>
      studioClient.createSchedule(videoUuid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio', 'videos'] });
      queryClient.invalidateQueries({ queryKey: ['studio', 'shorts'] });
      queryClient.invalidateQueries({ queryKey: ['studio', 'dashboard'] });
    },
  });
}

/**
 * Hook to update an existing publish schedule
 */
export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoUuid, payload }: { videoUuid: string; payload: UpdateSchedulePayload }) =>
      studioClient.updateSchedule(videoUuid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio', 'videos'] });
      queryClient.invalidateQueries({ queryKey: ['studio', 'shorts'] });
    },
  });
}

/**
 * Hook to delete a publish schedule (revert to draft)
 */
export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoUuid: string) => studioClient.deleteSchedule(videoUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio', 'videos'] });
      queryClient.invalidateQueries({ queryKey: ['studio', 'shorts'] });
    },
  });
}

/**
 * Hook to update video metadata
 * @deprecated Use useUpdateVideo() instead
 */
export function useUpdateVideoMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, payload }: { videoId: number; payload: UpdateVideoMetadataPayload }) =>
      studioClient.updateVideoMetadata(videoId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio', 'videos'] });
      queryClient.invalidateQueries({ queryKey: ['studio', 'dashboard'] });
    },
  });
}

/**
 * Hook to update video visibility
 * @deprecated Use useUpdateVideo() with publish_mode field instead
 */
export function useUpdateVideoVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, payload }: { videoId: number; payload: UpdateVisibilityPayload }) =>
      studioClient.updateVideoVisibility(videoId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio', 'videos'] });
      queryClient.invalidateQueries({ queryKey: ['studio', 'dashboard'] });
    },
  });
}

/**
 * Hook to update short visibility
 * @deprecated Use useUpdateVideo() with publish_mode field instead
 */
export function useUpdateShortVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, payload }: { videoId: number; payload: UpdateVisibilityPayload }) =>
      studioClient.updateShortVisibility(videoId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio', 'shorts'] });
      queryClient.invalidateQueries({ queryKey: ['studio', 'dashboard'] });
    },
  });
}

/**
 * Hook to prepare a draft upload (immediate upload flow)
 */
export function usePrepareDraftUpload() {
  return useMutation({
    mutationFn: (payload: PrepareBunnyUploadPayload) => studioClient.prepareBunnyUpload(payload),
  });
}
