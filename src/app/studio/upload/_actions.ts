'use server';

import { revalidatePath } from 'next/cache';
import { studioClient } from '@/api/client/studio.client';

/**
 * Delete video (uses UUID-based endpoint)
 */
export async function deleteVideoAction(videoUuid: string): Promise<{ success: boolean }> {
  const result = await studioClient.deleteVideo(videoUuid);

  if (result.success) {
    revalidatePath('/studio');
    revalidatePath('/studio/videos');
  }

  return result;
}

/**
 * Delete short (uses numeric ID - legacy endpoint)
 */
export async function deleteShortAction(shortId: number): Promise<{ success: boolean }> {
  const result = await studioClient.deleteShort(shortId);

  if (result.success) {
    revalidatePath('/studio');
    revalidatePath('/studio/shorts');
  }

  return result;
}
