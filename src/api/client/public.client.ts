/**
 * Public Content API Client
 *
 * API Endpoints:
 * - GET /public/videos → PaginatedResponse<Video>
 * - GET /public/map-videos → Video[]
 */

import type { PaginatedResponse, Video } from '../types';
import { apiClient } from './base-client';

export interface PublicVideosFilters extends Record<string, unknown> {
  page?: number;
}

export interface MapVideosFilters extends Record<string, unknown> {
  per_page?: number | undefined;
  types?: string | undefined;
  search?: string | undefined;
  creators?: number[] | undefined;
  countries?: string[] | undefined;
  auth?: boolean | undefined;
  compact?: boolean | undefined;
}

export const publicClient = {
  /**
   * Get public videos
   */
  getVideos: async (filters?: PublicVideosFilters): Promise<PaginatedResponse<Video>> => {
    const data = await apiClient.get<{
      videos?: PaginatedResponse<Video>;
    }>('/public/videos', {
      params: filters,
    });
    return data.videos || (data as unknown as PaginatedResponse<Video>);
  },

  /**
   * Get videos for map display
   */
  getMapVideos: async (filters?: MapVideosFilters): Promise<Video[]> => {
    const data = await apiClient.get<{
      videos?: Video[];
      data?: Video[];
    }>('/public/map-videos', { params: filters });
    return data.videos || data.data || [];
  },
};
