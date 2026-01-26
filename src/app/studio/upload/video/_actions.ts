'use server';

import { studioClient } from '@/api/client/studio.client';
import type { StudioUploadVideoPayload, StudioUploadVideoResponse } from '@/api/types';
import { revalidatePath } from 'next/cache';

/**
 * Delete a video from the studio
 */
export async function deleteVideoAction(videoId: number): Promise<{ success: boolean }> {
  const result = await studioClient.deleteVideo(videoId);

  if (result.success) {
    revalidatePath('/studio');
    revalidatePath('/studio/videos');
  }

  return result;
}

interface UploadVideoActionPayload {
  file: File;
  thumbnail: File | null;
  title: string;
  description?: string;
  tags?: string[];
  is_nsfw?: boolean;
}

export async function uploadVideoAction(
  payload: UploadVideoActionPayload
): Promise<StudioUploadVideoResponse> {
  const uploadPayload: StudioUploadVideoPayload = {
    file: payload.file,
    thumbnail: payload.thumbnail,
    title: payload.title,
  };

  if (payload.description) {
    uploadPayload.description = payload.description;
  }
  if (payload.tags && payload.tags.length > 0) {
    uploadPayload.tags = payload.tags;
  }
  if (payload.is_nsfw !== undefined) {
    uploadPayload.is_nsfw = payload.is_nsfw;
  }

  const result = await studioClient.uploadVideo(uploadPayload);

  if (result.success) {
    revalidatePath('/studio');
    revalidatePath('/studio/videos');
  }

  return result;
}
