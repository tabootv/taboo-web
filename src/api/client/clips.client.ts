/**
 * Clips API Client
 *
 * API Endpoints:
 * - GET /clips/my-clips → Video[]
 * - GET /clipping/videos/{id} → Video
 * - POST /clipping/clips → Video
 */

import type { ApiResponse, Video } from '../types';
import { apiClient } from './base-client';

export interface SaveClipData {
  video_id: number;
  start_time: number;
  end_time: number;
  title?: string;
}

export const clipsClient = {
  /**
   * Get user's clips
   */
  getMyClips: async (): Promise<Video[]> => {
    const data = await apiClient.get<{
      clips?: Video[];
      data?: Video[];
    }>('/clips/my-clips');
    return data.clips || data.data || [];
  },

  /**
   * Get video for clipping
   */
  getClippingVideo: async (id: number): Promise<Video> => {
    const data = await apiClient.get<ApiResponse<Video>>(`/clipping/videos/${id}`);
    return data.data;
  },

  /**
   * Save a new clip
   */
  saveClip: async (clipData: SaveClipData): Promise<Video> => {
    const data = await apiClient.post<ApiResponse<Video>>('/clipping/clips', clipData);
    return data.data;
  },
};
