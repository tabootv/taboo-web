// ============================================
// TabooTV API Client for Landing Page Integration
// ============================================

import type {
  Creator,
  Video,
  ShortVideo,
  Series,
  Course,
  Post,
  PaginatedResponse,
} from './types';

// API Base URL - change to beta.taboo.tv for testing
const API_URL = 'https://app.taboo.tv/api';

// Helper function to make API requests
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// Creator API Endpoints
// ============================================

export const creators = {
  /**
   * Get a single creator by ID
   * GET /creators/{id}
   */
  get: async (id: number): Promise<Creator> => {
    const data = await fetchAPI<{ creator?: Creator; data?: Creator }>(`/creators/${id}`);
    return data.creator || data.data || (data as unknown as Creator);
  },

  /**
   * Get all creators (paginated)
   * GET /creators
   */
  list: async (params?: { page?: number }): Promise<PaginatedResponse<Creator>> => {
    const queryString = params?.page ? `?page=${params.page}` : '';
    const data = await fetchAPI<{ creators?: PaginatedResponse<Creator> }>(`/creators${queryString}`);
    return data.creators || (data as unknown as PaginatedResponse<Creator>);
  },

  /**
   * Get creator's videos
   * GET /creators/creator-videos/{id}
   */
  getVideos: async (
    id: number,
    params?: { sort_by?: 'newest' | 'old' | 'trending' }
  ): Promise<PaginatedResponse<Video>> => {
    const queryString = params?.sort_by ? `?sort_by=${params.sort_by}` : '';
    const data = await fetchAPI<{ videos?: PaginatedResponse<Video> }>(
      `/creators/creator-videos/${id}${queryString}`
    );
    return data.videos || (data as unknown as PaginatedResponse<Video>);
  },

  /**
   * Get creator's shorts
   * GET /creators/creator-shorts/{id}
   */
  getShorts: async (
    id: number,
    params?: { sort_by?: 'newest' | 'old' | 'trending' }
  ): Promise<PaginatedResponse<ShortVideo>> => {
    const queryString = params?.sort_by ? `?sort_by=${params.sort_by}` : '';
    const data = await fetchAPI<{ videos?: PaginatedResponse<ShortVideo> }>(
      `/creators/creator-shorts/${id}${queryString}`
    );
    return data.videos || (data as unknown as PaginatedResponse<ShortVideo>);
  },

  /**
   * Get creator's series
   * GET /creators/creator-series/{id}
   */
  getSeries: async (
    id: number,
    params?: { sort_by?: 'newest' | 'old' | 'trending' }
  ): Promise<PaginatedResponse<Series>> => {
    const queryString = params?.sort_by ? `?sort_by=${params.sort_by}` : '';
    const data = await fetchAPI<{ series?: PaginatedResponse<Series> }>(
      `/creators/creator-series/${id}${queryString}`
    );
    return data.series || (data as unknown as PaginatedResponse<Series>);
  },

  /**
   * Get creator's posts
   * GET /creators/creator-posts/{id}
   */
  getPosts: async (
    id: number,
    params?: { sort_by?: 'newest' | 'old' | 'trending' }
  ): Promise<PaginatedResponse<Post>> => {
    const queryString = params?.sort_by ? `?sort_by=${params.sort_by}` : '';
    const data = await fetchAPI<{ posts?: PaginatedResponse<Post> }>(
      `/creators/creator-posts/${id}${queryString}`
    );
    return data.posts || (data as unknown as PaginatedResponse<Post>);
  },

  /**
   * Get creator's courses
   * GET /creators/creator-course/{id}
   */
  getCourses: async (
    id: number,
    params?: { sort_by?: 'newest' | 'old' | 'trending' }
  ): Promise<PaginatedResponse<Course>> => {
    const queryString = params?.sort_by ? `?sort_by=${params.sort_by}` : '';
    const data = await fetchAPI<{ courses?: PaginatedResponse<Course> }>(
      `/creators/creator-course/${id}${queryString}`
    );
    return data.courses || (data as unknown as PaginatedResponse<Course>);
  },
};

// ============================================
// Vanilla JavaScript version for Framer
// ============================================

export const creatorsJS = {
  get: async (id: number) => {
    const response = await fetch(`${API_URL}/creators/${id}`, {
      headers: { 'Accept': 'application/json' },
    });
    const data = await response.json();
    return data.creator || data.data || data;
  },

  getVideos: async (id: number, sortBy = 'newest') => {
    const response = await fetch(`${API_URL}/creators/creator-videos/${id}?sort_by=${sortBy}`, {
      headers: { 'Accept': 'application/json' },
    });
    const data = await response.json();
    return data.videos || data;
  },

  getShorts: async (id: number, sortBy = 'newest') => {
    const response = await fetch(`${API_URL}/creators/creator-shorts/${id}?sort_by=${sortBy}`, {
      headers: { 'Accept': 'application/json' },
    });
    const data = await response.json();
    return data.videos || data;
  },

  getSeries: async (id: number, sortBy = 'newest') => {
    const response = await fetch(`${API_URL}/creators/creator-series/${id}?sort_by=${sortBy}`, {
      headers: { 'Accept': 'application/json' },
    });
    const data = await response.json();
    return data.series || data;
  },

  getPosts: async (id: number, sortBy = 'newest') => {
    const response = await fetch(`${API_URL}/creators/creator-posts/${id}?sort_by=${sortBy}`, {
      headers: { 'Accept': 'application/json' },
    });
    const data = await response.json();
    return data.posts || data;
  },

  getCourses: async (id: number, sortBy = 'newest') => {
    const response = await fetch(`${API_URL}/creators/creator-course/${id}?sort_by=${sortBy}`, {
      headers: { 'Accept': 'application/json' },
    });
    const data = await response.json();
    return data.courses || data;
  },
};

export default creators;
