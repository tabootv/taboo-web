'use server';

import { studioClient } from '@/api/client/studio.client';
import type { StudioUploadShortPayload, StudioUploadShortResponse } from '@/api/types';
import { revalidatePath } from 'next/cache';

/**
 * Delete a short from the studio
 */
export async function deleteShortAction(shortId: number): Promise<{ success: boolean }> {
  const result = await studioClient.deleteShort(shortId);

  if (result.success) {
    revalidatePath('/studio');
    revalidatePath('/studio/shorts');
  }

  return result;
}

interface UploadShortActionPayload {
  file: File;
  thumbnail: File | null;
  title: string;
  description?: string;
  tags?: string[];
  is_nsfw?: boolean;
}

export async function uploadShortAction(
  payload: UploadShortActionPayload
): Promise<StudioUploadShortResponse> {
  const uploadPayload: StudioUploadShortPayload = {
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

  const result = await studioClient.uploadShort(uploadPayload);

  if (result.success) {
    revalidatePath('/studio');
    revalidatePath('/studio/shorts');
  }

  return result;
}
