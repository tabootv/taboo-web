/**
 * Series API Client
 *
 * API Endpoints:
 * - GET /home/series → Series[]
 * - GET /series/{id}/trailer → Series
 * - GET /series/{uuid}/play → { video, videos, series }
 */

import type { PaginatedResponse, Series, Video } from '../types';
import { apiClient } from './base-client';

export const seriesClient = {
  list: async (params?: {
    page?: number;
    sort_by?: string;
    category_ids?: number[];
  }): Promise<Series[]> => {
    const data = await apiClient.get<{ series?: { data?: Series[] } | Series[] }>(
      '/home/series',
      params ? { params } : undefined
    );
    const seriesData = data.series;
    if (Array.isArray(seriesData)) return seriesData;
    if (typeof seriesData === 'object' && seriesData !== null && 'data' in seriesData) {
      return Array.isArray(seriesData.data) ? seriesData.data : [];
    }
    return [];
  },

  getAll: async (page = 1, perPage = 12): Promise<PaginatedResponse<Series>> => {
    const data = await apiClient.get<{ series?: PaginatedResponse<Series> | Series[] }>(
      '/home/series',
      {
        params: { page, per_page: perPage },
      }
    );

    const seriesResponse = data.series;

    if (seriesResponse && 'data' in seriesResponse && Array.isArray(seriesResponse.data)) {
      return {
        data: seriesResponse.data,
        current_page: seriesResponse.current_page || page,
        last_page: seriesResponse.last_page || 1,
        per_page: seriesResponse.per_page || perPage,
        total: seriesResponse.total || 0,
        first_page_url: seriesResponse.first_page_url || '',
        from: seriesResponse.from || null,
        last_page_url: seriesResponse.last_page_url || '',
        links: seriesResponse.links || [],
        next_page_url: seriesResponse.next_page_url || null,
        path: seriesResponse.path || '',
        prev_page_url: seriesResponse.prev_page_url || null,
        to: seriesResponse.to || null,
      };
    }

    const seriesArray = Array.isArray(seriesResponse) ? seriesResponse : [];
    return {
      data: seriesArray,
      current_page: 1,
      last_page: 1,
      per_page: perPage,
      total: seriesArray.length,
      first_page_url: '',
      from: null,
      last_page_url: '',
      links: [],
      next_page_url: null,
      path: '',
      prev_page_url: null,
      to: null,
    };
  },

  getDetail: async (id: string | number): Promise<Series | null> => {
    try {
      const response = await apiClient.get<{ data?: { series?: Series }; series?: Series }>(
        `/series/${id}/trailer`
      );
      return response.data?.series || response.series || null;
    } catch {
      return null;
    }
  },

  getTrailer: async (id: string | number): Promise<{ url: string; series?: Series }> => {
    const response = await apiClient.get<{ data?: { series?: Series }; series?: Series }>(
      `/series/${id}/trailer`
    );
    const series = response.data?.series || response.series;
    const result: { url: string; series?: Series } = {
      url: series?.trailer_url || series?.trailer || '',
    };
    if (series) {
      result.series = series;
    }
    return result;
  },

  playVideo: async (uuid: string): Promise<{ video: Video; videos: Video[]; series: Series }> => {
    const data = await apiClient.get<{ video?: Video; videos?: Video[]; series?: Series }>(
      `/series/${uuid}/play`
    );
    return {
      video: data.video || (data as unknown as Video),
      videos: data.videos || [],
      series: data.series || ({} as Series),
    };
  },
};
