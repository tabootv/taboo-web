/**
 * Studio Mutation Hooks
 *
 * TanStack Query mutation hooks for studio operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  StudioCreatePostPayload,
  StudioUploadShortPayload,
  StudioUploadVideoPayload,
  UpdateVideoMetadataPayload,
  UpdateVisibilityPayload,
  PrepareBunnyUploadPayload,
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
 */
export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: number) => studioClient.deleteVideo(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio', 'videos'] });
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
 * Hook to update video metadata
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
