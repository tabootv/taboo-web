import apiClient from './client';

// Types for Creator Studio

export interface StudioCreator {
  id: number;
  name: string;
  channel_slug: string;
  avatar_url: string;
}

export interface StudioStats {
  totalVideos: number;
  totalShorts: number;
  totalPosts: number;
  totalViews?: number;
  totalWatchTimeSeconds?: number;
}

export interface StudioContentItem {
  id: number;
  uuid: string;
  title: string;
  thumbnail_url: string;
  created_at: string;
  views_count?: number;
  likes_count?: number;
}

export interface StudioDashboardResponse {
  creator: StudioCreator;
  stats: StudioStats;
  latestVideos: StudioContentItem[];
  latestShorts: StudioContentItem[];
}

export interface StudioUploadVideoPayload {
  file: File;
  thumbnail?: File | null;
  title: string;
  description?: string;
  tags?: string[];
  country_id?: number | null;
  is_nsfw?: boolean;
  series_id?: number | null;
}

export interface StudioUploadVideoResponse {
  success: boolean;
  video?: {
    id: number;
    uuid: string;
    title: string;
    thumbnail_url: string;
  };
  errors?: Record<string, string[]>;
}

export interface StudioUploadShortPayload {
  file: File;
  thumbnail?: File | null;
  title: string;
  description?: string;
  tags?: string[];
  country_id?: number | null;
  is_nsfw?: boolean;
}

export interface StudioUploadShortResponse {
  success: boolean;
  video?: {
    id: number;
    uuid: string;
    title: string;
    thumbnail_url: string;
  };
  errors?: Record<string, string[]>;
}

export interface StudioCreatePostPayload {
  body: string;
  image?: File | null;
  video?: File | null;
}

export interface StudioCreatePostResponse {
  success: boolean;
  post?: {
    id: number;
    body: string;
    created_at: string;
  };
  errors?: Record<string, string[]>;
}

export interface StudioVideoListItem {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  thumbnail: string;
  thumbnail_webp?: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  published_at?: string;
  status: 'draft' | 'processing' | 'published' | 'failed';
  duration?: number;
}

export interface StudioVideosListResponse {
  videos: StudioVideoListItem[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// API Functions

export const studio = {
  /**
   * Get creator studio dashboard data
   */
  async getDashboard(): Promise<StudioDashboardResponse> {
    const { data } = await apiClient.get('/studio/dashboard');
    return data.data;
  },

  /**
   * Get list of creator's videos
   */
  async getVideos(page: number = 1): Promise<StudioVideosListResponse> {
    const { data } = await apiClient.get('/studio/videos', { params: { page } });
    return data.data;
  },

  /**
   * Get list of creator's shorts
   */
  async getShorts(page: number = 1): Promise<StudioVideosListResponse> {
    const { data } = await apiClient.get('/studio/shorts', { params: { page } });
    return data.data;
  },

  /**
   * Upload a new video
   */
  async uploadVideo(payload: StudioUploadVideoPayload): Promise<StudioUploadVideoResponse> {
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

    const { data } = await apiClient.post('/studio/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Upload a new short
   */
  async uploadShort(payload: StudioUploadShortPayload): Promise<StudioUploadShortResponse> {
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

    const { data } = await apiClient.post('/studio/shorts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Create a community post
   */
  async createPost(payload: StudioCreatePostPayload): Promise<StudioCreatePostResponse> {
    const formData = new FormData();
    formData.append('body', payload.body);

    if (payload.image) {
      formData.append('image', payload.image);
    }
    if (payload.video) {
      formData.append('video', payload.video);
    }

    const { data } = await apiClient.post('/studio/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Delete a video
   */
  async deleteVideo(videoId: number): Promise<{ success: boolean }> {
    const { data } = await apiClient.delete(`/studio/videos/${videoId}`);
    return data;
  },

  /**
   * Delete a short
   */
  async deleteShort(videoId: number): Promise<{ success: boolean }> {
    const { data } = await apiClient.delete(`/studio/shorts/${videoId}`);
    return data;
  },
};
