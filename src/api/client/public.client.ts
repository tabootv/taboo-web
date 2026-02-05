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

export interface TagOption {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface MapVideosFilters extends Record<string, unknown> {
  page?: number | undefined;
  per_page?: number | undefined;
  types?: string | undefined;
  search?: string | undefined;
  channel_id?: number | undefined;
  countries?: string[] | undefined;
  tag_ids?: number[] | undefined;
  sort?: string | undefined;
  auth?: boolean | undefined;
  compact?: boolean | undefined;
}

export interface MapVideosPaginatedResponse {
  videos: Video[];
  pagination: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface CountriesResponse {
  data: { id: number; name: string; iso: string; emoji: string; videos_count: number }[];
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
   * Get videos for map display with optional pagination
   */
  getMapVideos: async (filters?: MapVideosFilters): Promise<MapVideosPaginatedResponse> => {
    const data = await apiClient.get<{
      videos?: Video[];
      data?: Video[];
      current_page?: number;
      last_page?: number;
      per_page?: number;
      total?: number;
    }>('/public/map-videos', { params: filters });

    const videos = data.videos || data.data || [];
    const perPage = filters?.per_page || 20;

    return {
      videos,
      pagination: {
        current_page: data.current_page || filters?.page || 1,
        last_page: data.last_page || Math.ceil((data.total || videos.length) / perPage),
        per_page: data.per_page || perPage,
        total: data.total || videos.length,
        from: 0,
        to: 0,
      },
    };
  },

  /**
   * Get all available countries for filtering
   * Returns simple string array when simple_list=true
   */
  getCountries: async (params?: { simple_list?: boolean }): Promise<CountriesResponse> => {
    const response = await apiClient.get<CountriesResponse>('/public/countries', {
      params,
    });
    return response;
  },

  /**
   * Get all available tags for filtering
   * Returns array of tag objects with id, name, and count
   */
  getTags: async (): Promise<TagOption[]> => {
    const response = await apiClient.get<{ data: TagOption[] }>('/public/tags');
    return response.data || [];
  },

  /**
   * Get all available categories for filtering
   * Returns simple string array when simple_list=true
   */
  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<{ data: string[] }>('/public/categories', {
      params: { simple_list: true },
    });
    return response.data || [];
  },
};
