'use server';

import { postsClient } from '@/api/client/posts.client';
import { revalidatePath } from 'next/cache';

/**
 * Delete a community post
 */
export async function deletePostAction(postId: number): Promise<{ success: boolean }> {
  try {
    await postsClient.delete(postId);

    revalidatePath('/community');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete post:', error);
    return { success: false };
  }
}
