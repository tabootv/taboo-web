/**
 * Home Feed API Client
 *
 * API Endpoints:
 * - GET /home/banners → Banner[]
 * - GET /home/featured-videos → Video[]
 * - GET /home/recommended-videos → Video[]
 * - GET /home/short-videos → Video[]
 * - GET /v2/home/short-videos → Video[]
 * - GET /home/series → Series[]
 * - GET /home/courses → Course[]
 * - GET /creators → Creator[]
 */

import type { Banner, Course, Creator, Series, Video } from '../types';
import { apiClient } from './base-client';

const extractArray = <T>(data: unknown, key?: string): T[] => {
  if (key && typeof data === 'object' && data !== null && key in data) {
    const value = (data as Record<string, unknown>)[key];
    if (Array.isArray(value)) return value as T[];
    if (typeof value === 'object' && value !== null && 'data' in value) {
      const nested = (value as { data?: unknown }).data;
      if (Array.isArray(nested)) return nested as T[];
    }
  }
  if (Array.isArray(data)) return data as T[];
  if (typeof data === 'object' && data !== null && 'data' in data) {
    const nested = (data as { data?: unknown }).data;
    if (Array.isArray(nested)) return nested as T[];
  }
  return [];
};

export const homeClient = {
  getBanners: async (): Promise<Banner[]> => {
    const data = await apiClient.get<{ banners?: Banner[]; data?: Banner[] }>('/home/banners');
    return extractArray<Banner>(data, 'banners');
  },

  getFeaturedVideos: async (): Promise<Video[]> => {
    const data = await apiClient.get<{ videos?: Video[]; data?: Video[] }>('/home/featured-videos');
    return extractArray<Video>(data, 'videos');
  },

  getShortVideos: async (): Promise<Video[]> => {
    const data = await apiClient.get<{ videos?: Video[]; data?: Video[] }>('/home/short-videos');
    return extractArray<Video>(data, 'videos');
  },

  getShortVideosV2: async (): Promise<Video[]> => {
    const data = await apiClient.get<{ videos?: Video[]; data?: Video[] }>('/v2/home/short-videos');
    return extractArray<Video>(data, 'videos');
  },

  getRecommendedVideos: async (): Promise<Video[]> => {
    const data = await apiClient.get<{ videos?: Video[]; data?: Video[] }>(
      '/home/recommended-videos'
    );
    return extractArray<Video>(data, 'videos');
  },

  getSeries: async (): Promise<Series[]> => {
    const data = await apiClient.get<{ series?: Series[]; data?: Series[] }>('/home/series');
    return extractArray<Series>(data, 'series');
  },

  getCourses: async (): Promise<Course[]> => {
    const data = await apiClient.get<{ courses?: Course[]; data?: Course[] }>('/home/courses');
    return extractArray<Course>(data, 'courses');
  },

  getCreators: async (): Promise<Creator[]> => {
    const data = await apiClient.get<{ creators?: { data?: Creator[] }; data?: Creator[] }>(
      '/creators',
      {
        params: { per_page: 20 },
      }
    );
    return data.creators?.data || data.data || [];
  },
};
