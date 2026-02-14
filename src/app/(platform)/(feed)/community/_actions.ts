'use server';

import { postsClient } from '@/api/client/posts.client';
import { revalidatePath } from 'next/cache';
import { createActionLogger } from '@/shared/lib/logger';

const log = createActionLogger('deletePostAction');

/**
 * Delete a community post
 */
export async function deletePostAction(postId: number): Promise<{ success: boolean }> {
  try {
    await postsClient.delete(postId);

    revalidatePath('/community');

    return { success: true };
  } catch (error) {
    log.error({ err: error }, 'Failed to delete post');
    return { success: false };
  }
}
