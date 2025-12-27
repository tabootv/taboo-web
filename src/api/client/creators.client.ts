/**
 * Creators API Client
 *
 * API Endpoints:
 * - GET /creators → CreatorListResponse
 * - GET /public/creators → CreatorListResponse (public)
 * - GET /creators/{id} → Creator
 * - POST /creators/{id}/follow-toggle → FollowResponse
 * - GET /creators/creator-videos/{id} → VideoListResponse
 * - GET /creators/creator-shorts/{id} → ShortVideoListResponse
 * - GET /creators/creator-series/{id} → SeriesListResponse
 * - GET /creators/creator-posts/{id} → PostListResponse
 * - GET /creators/creator-course/{id} → CourseListResponse
 */

import type {
  ApiResponse,
  Creator,
  Course,
  PaginatedResponse,
  Post,
  Series,
  ShortVideo,
  Video,
} from '../types';
import { apiClient } from './base-client';

export interface CreatorListFilters {
  page?: number;
  per_page?: number;
  id?: number;
  handler?: string;
}

export interface CreatorListResponse extends PaginatedResponse<Creator> {}

export interface FollowResponse {
  is_following: boolean;
  followers_count: number;
}

export const creatorsClient = {
  /**
   * Get creators list (requires auth)
   */
  list: async (filters?: CreatorListFilters): Promise<CreatorListResponse> => {
    const { data } = await apiClient.get('/creators', { params: filters });
    return data.creators || data;
  },

  /**
   * Get creators list from public endpoint (no auth required)
   */
  listPublic: async (
    filters?: CreatorListFilters
  ): Promise<{ data: Creator[]; creators?: Creator[] }> => {
    const { data } = await apiClient.get('/public/creators', { params: filters });
    const creators = data.data?.creators || data.creators || data.data || [];
    return { data: creators, creators };
  },

  /**
   * Get creator profile by ID
   */
  getProfile: async (id: string | number): Promise<Creator> => {
    const { data } = await apiClient.get(`/creators/${id}`);
    return data.creator || data.data || data;
  },

  /**
   * Toggle follow status
   */
  toggleFollow: async (id: string | number): Promise<FollowResponse> => {
    const { data } = await apiClient.post(`/creators/${id}/follow-toggle`);
    return data;
  },

  /**
   * Get creator videos
   */
  getVideos: async (
    id: string | number,
    params?: { sort_by?: string; page_url?: string }
  ): Promise<PaginatedResponse<Video>> => {
    const url = params?.page_url || `/creators/creator-videos/${id}`;
    const queryParams = params?.sort_by ? { sort_by: params.sort_by } : undefined;
    const { data } = await apiClient.get(url, { params: queryParams });
    return data.videos || data;
  },

  /**
   * Get creator shorts
   */
  getShorts: async (
    id: string | number,
    params?: { sort_by?: string; page_url?: string }
  ): Promise<PaginatedResponse<ShortVideo>> => {
    const url = params?.page_url || `/creators/creator-shorts/${id}`;
    const queryParams = params?.sort_by ? { sort_by: params.sort_by } : undefined;
    const { data } = await apiClient.get(url, { params: queryParams });
    return data.videos || data;
  },

  /**
   * Get creator series
   */
  getSeries: async (
    id: string | number,
    params?: { sort_by?: string; page_url?: string }
  ): Promise<PaginatedResponse<Series>> => {
    const url = params?.page_url || `/creators/creator-series/${id}`;
    const queryParams = params?.sort_by ? { sort_by: params.sort_by } : undefined;
    const { data } = await apiClient.get(url, { params: queryParams });
    return data.series || data;
  },

  /**
   * Get creator posts
   */
  getPosts: async (
    id: string | number,
    params?: { sort_by?: string; page_url?: string }
  ): Promise<PaginatedResponse<Post>> => {
    const url = params?.page_url || `/creators/creator-posts/${id}`;
    const queryParams = params?.sort_by ? { sort_by: params.sort_by } : undefined;
    const { data } = await apiClient.get(url, { params: queryParams });
    return data.posts || data;
  },

  /**
   * Get creator courses
   */
  getCourses: async (
    id: string | number,
    params?: { sort_by?: string; page_url?: string }
  ): Promise<PaginatedResponse<Course>> => {
    const url = params?.page_url || `/creators/creator-course/${id}`;
    const queryParams = params?.sort_by ? { sort_by: params.sort_by } : undefined;
    const { data } = await apiClient.get(url, { params: queryParams });
    return data.courses || data;
  },
};

