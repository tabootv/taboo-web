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
  Course,
  // ApiResponse,
  Creator,
  PaginatedResponse,
  Post,
  Series,
  ShortVideo,
  Video,
} from '../types';
import { apiClient } from './base-client';

export interface CreatorListFilters extends Record<string, unknown> {
  page?: number;
  per_page?: number;
  id?: number;
  handler?: string;
}

export interface CreatorListResponse extends PaginatedResponse<Creator> {}

export interface FollowResponse {
  creator: Creator;
}

export const creatorsClient = {
  /**
   * Get creators list (requires auth)
   */
  list: async (filters?: CreatorListFilters): Promise<CreatorListResponse> => {
    const data = await apiClient.get<{ creators?: CreatorListResponse } | CreatorListResponse>(
      '/creators',
      { params: filters as Record<string, unknown> }
    );
    return typeof data === 'object' && data !== null && 'creators' in data
      ? data.creators || data
      : (data as CreatorListResponse);
  },

  /**
   * Get creators list from public endpoint (no auth required)
   */
  listPublic: async (
    filters?: CreatorListFilters
  ): Promise<{ data: Creator[]; creators?: Creator[] }> => {
    const data = await apiClient.get<
      { data?: { creators?: Creator[] } | Creator[]; creators?: Creator[] } | Creator[]
    >('/public/creators', { params: filters as Record<string, unknown> });

    let creators: Creator[];
    if (Array.isArray(data)) {
      creators = data;
    } else if (data && typeof data === 'object') {
      if ('data' in data && data.data) {
        if (Array.isArray(data.data)) {
          creators = data.data;
        } else if (
          typeof data.data === 'object' &&
          'creators' in data.data &&
          Array.isArray(data.data.creators)
        ) {
          creators = data.data.creators;
        } else {
          creators = [];
        }
      } else if ('creators' in data && Array.isArray(data.creators)) {
        creators = data.creators;
      } else {
        creators = [];
      }
    } else {
      creators = [];
    }

    return { data: creators, creators };
  },

  /**
   * Get creator profile by ID
   */
  getProfile: async (id: string | number): Promise<Creator> => {
    const data = await apiClient.get<{ creator?: Creator; data?: Creator } | Creator>(
      `/creators/${id}`
    );
    if (data && typeof data === 'object') {
      if ('creator' in data && data.creator) return data.creator;
      if ('data' in data && data.data) return data.data;
      if ('id' in data) return data as Creator;
    }
    return data as Creator;
  },

  /**
   * Toggle follow status
   */
  toggleFollow: async (id: string | number): Promise<FollowResponse> => {
    const data = await apiClient.post<FollowResponse>(`/creators/${id}/follow-toggle`);
    return data;
  },

  /**
   * Get creator videos
   */
  getVideos: async (
    id: string | number,
    params?: { sort_by?: string; per_page?: number; page?: number }
  ): Promise<PaginatedResponse<Video>> => {
    const queryParams: Record<string, unknown> = {};
    if (params?.sort_by) queryParams.sort_by = params.sort_by;
    if (params?.per_page) queryParams.per_page = params.per_page;
    if (params?.page) queryParams.page = params.page;
    const data = await apiClient.get<
      { videos?: PaginatedResponse<Video> } | PaginatedResponse<Video>
    >(`/creators/creator-videos/${id}`, {
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
    return typeof data === 'object' && data !== null && 'videos' in data
      ? data.videos || data
      : (data as PaginatedResponse<Video>);
  },

  /**
   * Get creator shorts
   */
  getShorts: async (
    id: string | number,
    params?: { sort_by?: string; per_page?: number; page?: number }
  ): Promise<PaginatedResponse<ShortVideo>> => {
    const queryParams: Record<string, unknown> = {};
    if (params?.sort_by) queryParams.sort_by = params.sort_by;
    if (params?.per_page) queryParams.per_page = params.per_page;
    if (params?.page) queryParams.page = params.page;
    const data = await apiClient.get<
      { videos?: PaginatedResponse<ShortVideo> } | PaginatedResponse<ShortVideo>
    >(`/creators/creator-shorts/${id}`, {
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
    return typeof data === 'object' && data !== null && 'videos' in data
      ? data.videos || data
      : (data as PaginatedResponse<ShortVideo>);
  },

  /**
   * Get creator series
   */
  getSeries: async (
    id: string | number,
    params?: { sort_by?: string; per_page?: number; page?: number }
  ): Promise<PaginatedResponse<Series>> => {
    const queryParams: Record<string, unknown> = {};
    if (params?.sort_by) queryParams.sort_by = params.sort_by;
    if (params?.per_page) queryParams.per_page = params.per_page;
    if (params?.page) queryParams.page = params.page;
    const data = await apiClient.get<
      { series?: PaginatedResponse<Series> } | PaginatedResponse<Series>
    >(`/creators/creator-series/${id}`, {
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
    return typeof data === 'object' && data !== null && 'series' in data
      ? data.series || data
      : (data as PaginatedResponse<Series>);
  },

  /**
   * Get creator posts
   */
  getPosts: async (
    id: string | number,
    params?: { sort_by?: string; page?: number }
  ): Promise<PaginatedResponse<Post>> => {
    const queryParams: Record<string, unknown> = {};
    if (params?.sort_by) queryParams.sort_by = params.sort_by;
    if (params?.page) queryParams.page = params.page;
    const data = await apiClient.get<{ posts?: PaginatedResponse<Post> } | PaginatedResponse<Post>>(
      `/creators/creator-posts/${id}`,
      { params: Object.keys(queryParams).length > 0 ? queryParams : undefined }
    );
    return typeof data === 'object' && data !== null && 'posts' in data
      ? data.posts || data
      : (data as PaginatedResponse<Post>);
  },

  /**
   * Get creator courses
   */
  getCourses: async (
    id: string | number,
    params?: { sort_by?: string; per_page?: number; page?: number }
  ): Promise<PaginatedResponse<Course>> => {
    const queryParams: Record<string, unknown> = {};
    if (params?.sort_by) queryParams.sort_by = params.sort_by;
    if (params?.per_page) queryParams.per_page = params.per_page;
    if (params?.page) queryParams.page = params.page;
    const data = await apiClient.get<
      { courses?: PaginatedResponse<Course> } | PaginatedResponse<Course>
    >(`/creators/creator-course/${id}`, {
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
    return typeof data === 'object' && data !== null && 'courses' in data
      ? data.courses || data
      : (data as PaginatedResponse<Course>);
  },
};
