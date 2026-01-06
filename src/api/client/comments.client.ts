/**
 * Comments API Client
 *
 * API Endpoints:
 * - POST /comments/{uuid}/like-toggle → LikeResponse
 * - POST /comments/{uuid}/dislike-toggle → DislikeResponse
 * - DELETE /videos/{uuid}/delete → void (delete comment)
 */

import type { DislikeResponse, LikeResponse } from '../types';
import { apiClient } from './base-client';

export const commentsClient = {
  /**
   * Toggle like on a comment
   */
  toggleLike: async (uuid: string): Promise<LikeResponse> => {
    return await apiClient.post<LikeResponse>(`/comments/${uuid}/like-toggle`);
  },

  /**
   * Toggle dislike on a comment
   */
  toggleDislike: async (uuid: string): Promise<DislikeResponse> => {
    return await apiClient.post<DislikeResponse>(`/comments/${uuid}/dislike-toggle`);
  },

  /**
   * Delete a comment
   */
  delete: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/videos/${uuid}/delete`);
  },
};
