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
 * - POST /videos/prepare-bunny-upload → PrepareBunnyUploadResponse
 * - PATCH /studio/videos/{id} → UpdateVideoResponse
 * - PATCH /studio/videos/{id}/visibility → UpdateVideoResponse
 * - PATCH /studio/shorts/{id}/visibility → UpdateVideoResponse
 * - DELETE /studio/videos/{id} → { success: boolean }
 * - DELETE /studio/shorts/{id} → { success: boolean }
 */

import type {
  ApiResponse,
  PrepareBunnyUploadPayload,
  PrepareBunnyUploadResponse,
  StudioContentListResponse,
  StudioCreatePostPayload,
  StudioCreatePostResponse,
  StudioDashboardResponse,
  StudioPostsListResponse,
  StudioUploadShortPayload,
  StudioUploadShortResponse,
  StudioUploadVideoPayload,
  StudioUploadVideoResponse,
  StudioVideosListResponse,
  UpdateVideoMetadataPayload,
  UpdateVideoResponse,
  UpdateVisibilityPayload,
} from '../types';
import { apiClient } from './base-client';

export const studioClient = {
  /**
   * Get creator studio dashboard data
   */
  getDashboard: async (): Promise<StudioDashboardResponse> => {
    const data = await apiClient.get<ApiResponse<StudioDashboardResponse>>('/studio/dashboard');
    return data.data;
  },

  /**
   * Get list of creator's videos
   * @deprecated Use videoClient.list() with creator_id filter instead
   */
  getVideos: async (page = 1): Promise<StudioVideosListResponse> => {
    const data = await apiClient.get<ApiResponse<StudioVideosListResponse>>('/videos', {
      params: { page } as Record<string, unknown>,
    });
    return data.data;
  },

  /**
   * Get list of creator's shorts
   * @deprecated Use videoClient.list() with creator_id and short=true filters instead
   */
  getShorts: async (page = 1): Promise<StudioVideosListResponse> => {
    const data = await apiClient.get<ApiResponse<StudioVideosListResponse>>('/studio/shorts', {
      params: { page } as Record<string, unknown>,
    });
    return data.data;
  },

  /**
   * Get list of creator's posts
   * @deprecated Use creatorsClient.getPosts() with channel ID instead
   */
  getPosts: async (page = 1): Promise<StudioPostsListResponse> => {
    const data = await apiClient.get<ApiResponse<StudioPostsListResponse>>('/studio/posts', {
      params: { page } as Record<string, unknown>,
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

    const data = await apiClient.post<StudioUploadVideoResponse>('/studio/videos', formData, {
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

    const data = await apiClient.post<StudioUploadShortResponse>('/studio/shorts', formData, {
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

    const data = await apiClient.post<StudioCreatePostResponse>('/studio/posts', formData, {
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
    const data = await apiClient.delete<{ success: boolean }>(`/studio/videos/${videoId}`);
    return data;
  },

  /**
   * Delete a short
   */
  deleteShort: async (videoId: number): Promise<{ success: boolean }> => {
    const data = await apiClient.delete<{ success: boolean }>(`/studio/shorts/${videoId}`);
    return data;
  },

  /**
   * Delete a post
   */
  deletePost: async (postId: number): Promise<{ success: boolean }> => {
    const data = await apiClient.delete<{ success: boolean }>(`/posts/${postId}`);
    return data;
  },

  /**
   * Prepare a video upload and get TUS credentials
   * This bypasses the server action 2MB body limit by only sending metadata
   * The actual video file is uploaded directly to Bunny via TUS
   */
  prepareBunnyUpload: async (
    payload: PrepareBunnyUploadPayload
  ): Promise<PrepareBunnyUploadResponse> => {
    const data = await apiClient.post<PrepareBunnyUploadResponse>(
      '/videos/prepare-bunny-upload',
      payload
    );
    return data;
  },

  /**
   * Update video metadata (title, description, tags, etc.)
   */
  updateVideoMetadata: async (
    videoId: number,
    payload: UpdateVideoMetadataPayload
  ): Promise<UpdateVideoResponse> => {
    const data = await apiClient.patch<UpdateVideoResponse>(`/studio/videos/${videoId}`, payload);
    return data;
  },

  /**
   * Update video visibility
   */
  updateVideoVisibility: async (
    videoId: number,
    payload: UpdateVisibilityPayload
  ): Promise<UpdateVideoResponse> => {
    const data = await apiClient.patch<UpdateVideoResponse>(
      `/studio/videos/${videoId}/visibility`,
      payload
    );
    return data;
  },

  /**
   * Update short visibility
   */
  updateShortVisibility: async (
    videoId: number,
    payload: UpdateVisibilityPayload
  ): Promise<UpdateVideoResponse> => {
    const data = await apiClient.patch<UpdateVideoResponse>(
      `/studio/shorts/${videoId}/visibility`,
      payload
    );
    return data;
  },

  /**
   * Get content list for content management hub
   */
  getContent: async (type: 'video' | 'short', page = 1): Promise<StudioContentListResponse> => {
    const endpoint = type === 'short' ? '/studio/shorts' : '/studio/videos';
    const data = await apiClient.get<ApiResponse<StudioContentListResponse>>(endpoint, {
      params: { page } as Record<string, unknown>,
    });
    return data.data;
  },
};
