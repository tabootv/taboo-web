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
  getBanners: async (serverToken?: string): Promise<Banner[]> => {
    const data = await apiClient.get<{ banners?: Banner[]; data?: Banner[] }>(
      '/home/banners',
      serverToken ? { serverToken } : undefined
    );
    return extractArray<Banner>(data, 'banners');
  },

  getFeaturedVideos: async (serverToken?: string): Promise<Video[]> => {
    const data = await apiClient.get<{ videos?: Video[]; data?: Video[] }>(
      '/home/featured-videos',
      serverToken ? { serverToken } : undefined
    );
    return extractArray<Video>(data, 'videos');
  },

  getShortVideos: async (serverToken?: string): Promise<Video[]> => {
    const data = await apiClient.get<{ videos?: Video[]; data?: Video[] }>(
      '/home/short-videos',
      serverToken ? { serverToken } : undefined
    );
    return extractArray<Video>(data, 'videos');
  },

  getShortVideosV2: async (serverToken?: string): Promise<Video[]> => {
    const data = await apiClient.get<{ videos?: Video[]; data?: Video[] }>(
      '/v2/home/short-videos',
      serverToken ? { serverToken } : undefined
    );
    return extractArray<Video>(data, 'videos');
  },

  getRecommendedVideos: async (serverToken?: string): Promise<Video[]> => {
    const data = await apiClient.get<{ videos?: Video[]; data?: Video[] }>(
      '/home/recommended-videos',
      serverToken ? { serverToken } : undefined
    );
    return extractArray<Video>(data, 'videos');
  },

  getSeries: async (serverToken?: string): Promise<Series[]> => {
    const data = await apiClient.get<{ series?: Series[]; data?: Series[] }>(
      '/home/series',
      serverToken ? { serverToken } : undefined
    );
    return extractArray<Series>(data, 'series');
  },

  getCourses: async (serverToken?: string): Promise<Course[]> => {
    const data = await apiClient.get<{ courses?: Course[]; data?: Course[] }>(
      '/home/courses',
      serverToken ? { serverToken } : undefined
    );
    return extractArray<Course>(data, 'courses');
  },

  getCreators: async (serverToken?: string): Promise<Creator[]> => {
    const data = await apiClient.get<{ creators?: { data?: Creator[] }; data?: Creator[] }>(
      '/creators',
      {
        params: { per_page: 20 },
        ...(serverToken ? { serverToken } : {}),
      }
    );
    return data.creators?.data || data.data || [];
  },
};
