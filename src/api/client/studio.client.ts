/**
 * Studio API Client (Creator Studio)
 *
 * API Endpoints:
 * - GET /studio/dashboard → StudioDashboardResponse
 * - GET /studio/videos → StudioVideosListResponse
 * - GET /studio/shorts → StudioVideosListResponse
 * - POST /studio/videos → StudioUploadVideoResponse
 * - POST /studio/shorts → StudioUploadShortResponse
 * - POST /studio/posts → StudioCreatePostResponse
 * - DELETE /studio/videos/{id} → { success: boolean }
 * - DELETE /studio/shorts/{id} → { success: boolean }
 */

import type {
  ApiResponse,
  StudioCreatePostPayload,
  StudioCreatePostResponse,
  StudioDashboardResponse,
  StudioUploadShortPayload,
  StudioUploadShortResponse,
  StudioUploadVideoPayload,
  StudioUploadVideoResponse,
  StudioVideosListResponse,
} from '../types';
import { apiClient } from './base-client';

export const studioClient = {
  /**
   * Get creator studio dashboard data
   */
  getDashboard: async (): Promise<StudioDashboardResponse> => {
    const { data } = await apiClient.get<ApiResponse<StudioDashboardResponse>>('/studio/dashboard');
    return data.data;
  },

  /**
   * Get list of creator's videos
   */
  getVideos: async (page = 1): Promise<StudioVideosListResponse> => {
    const { data } = await apiClient.get<ApiResponse<StudioVideosListResponse>>('/studio/videos', {
      params: { page },
    });
    return data.data;
  },

  /**
   * Get list of creator's shorts
   */
  getShorts: async (page = 1): Promise<StudioVideosListResponse> => {
    const { data } = await apiClient.get<ApiResponse<StudioVideosListResponse>>('/studio/shorts', {
      params: { page },
    });
    return data.data;
  },

  /**
   * Upload a new video
   */
  uploadVideo: async (payload: StudioUploadVideoPayload): Promise<StudioUploadVideoResponse> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('title', payload.title);
    formData.append('type', 'video');

    if (payload.thumbnail) {
      formData.append('thumbnail', payload.thumbnail);
    }
    if (payload.description) {
      formData.append('description', payload.description);
    }
    if (payload.tags && payload.tags.length > 0) {
      payload.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });
    }
    if (payload.country_id) {
      formData.append('country_id', String(payload.country_id));
    }
    if (payload.is_nsfw !== undefined) {
      formData.append('is_nsfw', payload.is_nsfw ? '1' : '0');
    }
    if (payload.series_id) {
      formData.append('series_id', String(payload.series_id));
    }

    const { data } = await apiClient.post<StudioUploadVideoResponse>('/studio/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Upload a new short
   */
  uploadShort: async (payload: StudioUploadShortPayload): Promise<StudioUploadShortResponse> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('title', payload.title);
    formData.append('type', 'short');

    if (payload.thumbnail) {
      formData.append('thumbnail', payload.thumbnail);
    }
    if (payload.description) {
      formData.append('description', payload.description);
    }
    if (payload.tags && payload.tags.length > 0) {
      payload.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });
    }
    if (payload.country_id) {
      formData.append('country_id', String(payload.country_id));
    }
    if (payload.is_nsfw !== undefined) {
      formData.append('is_nsfw', payload.is_nsfw ? '1' : '0');
    }

    const { data } = await apiClient.post<StudioUploadShortResponse>('/studio/shorts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Create a community post
   */
  createPost: async (payload: StudioCreatePostPayload): Promise<StudioCreatePostResponse> => {
    const formData = new FormData();
    formData.append('body', payload.body);

    if (payload.image) {
      formData.append('image', payload.image);
    }
    if (payload.video) {
      formData.append('video', payload.video);
    }

    const { data } = await apiClient.post<StudioCreatePostResponse>('/studio/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Delete a video
   */
  deleteVideo: async (videoId: number): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete<{ success: boolean }>(`/studio/videos/${videoId}`);
    return data;
  },

  /**
   * Delete a short
   */
  deleteShort: async (videoId: number): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete<{ success: boolean }>(`/studio/shorts/${videoId}`);
    return data;
  },
};

