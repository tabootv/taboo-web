'use server';

import { revalidatePath } from 'next/cache';
import { studioClient } from '@/api/client/studio.client';
import type { UploadType } from './_config/types';

/**
 * Delete content (video or short)
 */
export async function deleteContentAction(
  type: UploadType,
  contentId: number
): Promise<{ success: boolean }> {
  const result =
    type === 'video'
      ? await studioClient.deleteVideo(contentId)
      : await studioClient.deleteShort(contentId);

  if (result.success) {
    revalidatePath('/studio');
    revalidatePath(type === 'video' ? '/studio/videos' : '/studio/shorts');
  }

  return result;
}

/**
 * Convenience wrappers
 */
export async function deleteVideoAction(videoId: number): Promise<{ success: boolean }> {
  return deleteContentAction('video', videoId);
}

export async function deleteShortAction(shortId: number): Promise<{ success: boolean }> {
  return deleteContentAction('short', shortId);
}
