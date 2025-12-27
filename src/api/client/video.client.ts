/**
 * Video API Client
 *
 * API Endpoints:
 * - GET /videos/{id}/play → Video
 * - GET /public/videos → VideoListResponse
 * - GET /public/videos/related → VideoListResponse
 * - POST /videos/{id}/toggle-like → LikeResponse
 * - POST /videos/{id}/toggle-dislike → DislikeResponse
 * - POST /videos/{id}/toggle-bookmark → BookmarkResponse
 * - GET /videos/{id}/comments-list → CommentListResponse
 * - POST /videos/{id}/comment → Comment
 */

import type {
  ApiResponse,
  BookmarkResponse,
  Comment,
  CommentListResponse,
  DislikeResponse,
  LikeResponse,
  Video,
  VideoListResponse,
} from '../types';
import { apiClient } from './base-client';

export interface VideoListFilters {
  page?: number;
  per_page?: number;
  limit?: number;
  short?: boolean;
  is_short?: boolean;
  type?: string;
  published?: boolean;
  sort_by?: string;
  order?: 'asc' | 'desc';
}

export interface RelatedVideoFilters {
  video_id: string | number;
  page?: number;
  limit?: number;
  short?: boolean;
  is_short?: boolean;
  type?: string;
  published?: boolean;
  sort_by?: string;
  order?: 'asc' | 'desc';
}

const transformVideoResponse = (data: {
  videos?: Video[];
  pagination?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}): VideoListResponse => {
  const videos = (data.videos || []).map(
    (video: Video & { creator?: { channel?: { id: number; name: string } } }) => ({
      ...video,
      channel: video.channel || video.creator?.channel,
    })
  );

  return {
    data: videos,
    current_page: data.pagination?.current_page || 1,
    last_page: data.pagination?.last_page || 1,
    per_page: data.pagination?.per_page || 20,
    total: data.pagination?.total || 0,
    first_page_url: '',
    from: null,
    last_page_url: '',
    links: [],
    next_page_url: null,
    path: '',
    prev_page_url: null,
    to: null,
  };
};

export const videoClient = {
  /**
   * Get a single video by ID or UUID
   */
  get: async (id: string | number): Promise<Video> => {
    const data = await apiClient.get<{ video?: Video; data?: Video }>(`/videos/${id}/play`);
    return data.video || data.data || (data as Video);
  },

  /**
   * Play video (returns video + related videos)
   */
  play: async (id: string | number): Promise<{ video: Video; videos: Video[] }> => {
    const data = await apiClient.get<{ video?: Video; videos?: Video[]; data?: Video }>(
      `/videos/${id}/play`
    );
    return {
      video: data.video || data.data || (data as Video),
      videos: data.videos || [],
    };
  },

  /**
   * Get list of videos with filters
   */
  list: async (filters?: VideoListFilters): Promise<VideoListResponse> => {
    const params = {
      page: filters?.page,
      limit: filters?.limit || filters?.per_page || 24,
      short: filters?.short ?? false,
      is_short: filters?.is_short ?? false,
      type: filters?.type || 'video',
      published: filters?.published ?? true,
      sort_by: filters?.sort_by || 'published_at',
      order: filters?.order || 'desc',
    };

    const data = await apiClient.get<{
      videos?: Video[];
      pagination?: {
        current_page?: number;
        last_page?: number;
        per_page?: number;
        total?: number;
      };
    }>('/public/videos', { params });

    return transformVideoResponse(data);
  },

  /**
   * Get long-form videos only (excludes shorts)
   */
  getLongForm: async (page = 1, perPage = 24): Promise<VideoListResponse> => {
    const response = await videoClient.list({
      page,
      per_page: perPage,
      short: false,
      is_short: false,
      type: 'video',
      published: true,
    });

    // Defensive: filter out any shorts if backend ignores flags
    const filtered = response.data.filter((v) => {
      if (v?.short === true || v?.is_short === true || v?.type === 'short') {
        return false;
      }
      return true;
    });

    if (process.env.NODE_ENV === 'development' && filtered.length !== response.data.length) {
      console.warn('Filtered out short content from /videos response');
    }

    return { ...response, data: filtered };
  },

  /**
   * Get related videos for a video
   */
  getRelated: async (
    videoId: string | number,
    page = 1,
    perPage = 12
  ): Promise<VideoListResponse> => {
    try {
      const data = await apiClient.get<{
        videos?: Video[];
        data?: Video[];
        pagination?: {
          current_page?: number;
          last_page?: number;
          total?: number;
        };
      }>('/public/videos/related', {
        params: {
          video_id: videoId,
          page,
          limit: perPage,
          short: false,
          is_short: false,
          type: 'video',
          published: true,
          sort_by: 'published_at',
          order: 'desc',
        },
      });

      const list = data?.videos || data?.data || [];
      const filtered = list.filter(
        (v) => v?.id !== videoId && v?.short !== true && v?.is_short !== true && v?.type !== 'short'
      );

      return {
        data: filtered,
        current_page: data?.pagination?.current_page ?? page,
        last_page: data?.pagination?.last_page ?? page,
        per_page: perPage,
        total: data?.pagination?.total ?? filtered.length,
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
      // Fallback: use long-form list and filter out current video
      const fallback = await videoClient.getLongForm(page, perPage + 4);
      fallback.data = fallback.data.filter((v) => v?.id !== videoId);
      return fallback;
    }
  },

  /**
   * Toggle like on a video
   */
  toggleLike: async (id: string | number): Promise<LikeResponse> => {
    return apiClient.post<LikeResponse>(`/videos/${id}/toggle-like`);
  },

  /**
   * Toggle dislike on a video
   */
  toggleDislike: async (id: string | number): Promise<DislikeResponse> => {
    return apiClient.post<DislikeResponse>(`/videos/${id}/toggle-dislike`);
  },

  /**
   * Toggle bookmark on a video
   */
  toggleBookmark: async (id: string | number): Promise<BookmarkResponse> => {
    return apiClient.post<BookmarkResponse>(`/videos/${id}/toggle-bookmark`);
  },

  /**
   * Get comments for a video
   */
  getComments: async (id: string | number, page = 1): Promise<CommentListResponse> => {
    const data = await apiClient.get<{ comments?: CommentListResponse }>(
      `/videos/${id}/comments-list`,
      {
        params: { page },
      }
    );
    return data.comments || (data as CommentListResponse);
  },

  /**
   * Add a comment to a video
   */
  addComment: async (id: string | number, content: string, parentId?: number): Promise<Comment> => {
    const data = await apiClient.post<ApiResponse<Comment>>(`/videos/${id}/comment`, {
      content,
      parent_id: parentId,
    });
    return data.data;
  },

  /**
   * Toggle autoplay preference
   */
  toggleAutoplay: async (): Promise<{ video_autoplay: boolean }> => {
    return apiClient.post<{ video_autoplay: boolean }>('/videos/toggle-autoplay');
  },

  /**
   * Get bookmarked videos
   */
  getBookmarked: async (page = 1, perPage = 12): Promise<VideoListResponse> => {
    const { data } = await apiClient.get('/profile/bookmarked-videos', {
      params: { page, per_page: perPage },
    });
    return data.videos || data;
  },

  /**
   * Get watch history
   */
  getHistory: async (page = 1, perPage = 12): Promise<VideoListResponse> => {
    const { data } = await apiClient.get('/profile/watch-history', {
      params: { page, per_page: perPage },
    });
    return data.videos || data;
  },

  /**
   * Get liked videos
   */
  getLiked: async (page = 1, perPage = 12): Promise<VideoListResponse> => {
    const { data } = await apiClient.get('/profile/liked-videos', {
      params: { page, per_page: perPage },
    });
    return data.videos || data;
  },
};
