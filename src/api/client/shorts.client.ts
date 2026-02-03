/**
 * Shorts API Client
 *
 * API Endpoints:
 * - GET /v2/shorts → PaginatedResponse<ShortVideo>
 * - GET /v2/shorts/{uuid} → { videos: PaginatedResponse<ShortVideo> }
 * - GET /v2/shorts/{uuid}/comments → PaginatedResponse<Comment>
 * - POST /videos/{uuid}/like-toggle → LikeResponse
 * - POST /v2/shorts/{uuid}/toggle-bookmark → BookmarkResponse
 */

import type {
  BookmarkResponse,
  Comment,
  LikeResponse,
  PaginatedResponse,
  ShortVideo,
} from '../types';
import { apiClient } from './base-client';

export interface ShortsListFilters extends Record<string, unknown> {
  page?: number;
  per_page?: number;
  creator?: number;
}

interface ShortDetailApiResponse {
  message?: string;
  videos?: PaginatedResponse<ShortVideo>;
  video?: ShortVideo;
  data?: ShortVideo;
}

export const shortsClient = {
  /**
   * Get paginated list of shorts
   */
  list: async (filters?: ShortsListFilters): Promise<PaginatedResponse<ShortVideo>> => {
    try {
      const data = await apiClient.get<{ videos?: PaginatedResponse<ShortVideo> }>('/v2/shorts', {
        params: filters,
      });

      const shortsData = data.videos || data;

      // Handle paginated response
      if ('data' in shortsData && Array.isArray(shortsData.data)) {
        return shortsData as PaginatedResponse<ShortVideo>;
      }

      // Handle array response - wrap in pagination structure
      if (Array.isArray(shortsData)) {
        return {
          data: shortsData,
          current_page: filters?.page || 1,
          last_page: 1,
          per_page: filters?.per_page || 10,
          total: shortsData.length,
          first_page_url: '',
          from: null,
          last_page_url: '',
          links: [],
          next_page_url: null,
          path: '',
          prev_page_url: null,
          to: null,
        };
      }

      return shortsData as PaginatedResponse<ShortVideo>;
    } catch {
      // Fallback: Try home/short-videos endpoint
      try {
        const data = await apiClient.get<{
          videos?: ShortVideo[];
          data?: ShortVideo[];
        }>('/v2/home/short-videos');

        const shortsArray = data.videos || data.data || [];

        return {
          data: shortsArray,
          current_page: 1,
          last_page: 1,
          per_page: shortsArray.length,
          total: shortsArray.length,
          first_page_url: '',
          from: null,
          last_page_url: '',
          links: [],
          next_page_url: null,
          path: '',
          prev_page_url: null,
          to: null,
        };
      } catch {
        // Return empty response instead of throwing
        return {
          data: [],
          current_page: 1,
          last_page: 1,
          per_page: 0,
          total: 0,
          first_page_url: '',
          from: null,
          last_page_url: '',
          links: [],
          next_page_url: null,
          path: '',
          prev_page_url: null,
          to: null,
        };
      }
    }
  },

  /**
   * Get a single short by UUID
   */
  get: async (uuid: string): Promise<ShortVideo | null> => {
    try {
      const data = await apiClient.get<ShortDetailApiResponse>(`/v2/shorts/${uuid}`);

      // Primary: paginated response { videos: { data: [ShortVideo] } }
      if (data.videos?.data?.[0]) {
        return data.videos.data[0];
      }

      // Fallback: direct video property
      if (data.video) {
        return data.video;
      }

      // Fallback: ApiResponse<ShortVideo> format
      if (data.data && typeof data.data === 'object' && 'uuid' in data.data) {
        return data.data as ShortVideo;
      }

      return null;
    } catch {
      return null;
    }
  },

  /**
   * Get comments for a short
   */
  getComments: async (uuid: string, page = 1): Promise<PaginatedResponse<Comment>> => {
    const data = await apiClient.get<{
      comments?: PaginatedResponse<Comment>;
    }>(`/v2/shorts/${uuid}/comments`, {
      params: { page },
    });
    return data.comments || (data as unknown as PaginatedResponse<Comment>);
  },

  /**
   * Toggle like on a short
   */
  toggleLike: async (uuid: string): Promise<LikeResponse> => {
    return await apiClient.post<LikeResponse>(`/videos/${uuid}/toggle-like`);
  },

  /**
   * Toggle bookmark on a short
   */
  toggleBookmark: async (uuid: string): Promise<BookmarkResponse> => {
    return await apiClient.post<BookmarkResponse>(`/v2/shorts/${uuid}/toggle-bookmark`);
  },
};
