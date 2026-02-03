/**
 * Series API Client
 *
 * API Endpoints:
 * - GET /series → { message, series[], pagination }
 * - GET /series/{id}/trailer → Series
 * - GET /series/{uuid}/play → { video, videos, series }
 */

import type { PaginatedResponse, Series, Video } from '../types';
import { apiClient } from './base-client';

export interface SeriesListFilters {
  page?: number;
  sort_by?: string;
  channel_id?: number;
  per_page?: number;
  category_ids?: number[];
}

export const seriesClient = {
  list: async (filters?: SeriesListFilters): Promise<PaginatedResponse<Series>> => {
    const params: Record<string, unknown> = {};
    if (filters?.page) params.page = filters.page;
    if (filters?.sort_by) params.sort_by = filters.sort_by;
    if (filters?.channel_id) params.channel_id = filters.channel_id;
    if (filters?.per_page) params.per_page = filters.per_page;
    if (filters?.category_ids) params.category_ids = filters.category_ids;

    const data = await apiClient.get<{
      message?: string;
      series?: Series[];
      pagination?: { total: number; per_page: number; current_page: number; last_page: number };
    }>('/series', Object.keys(params).length > 0 ? { params } : undefined);

    const seriesArray = data.series || [];
    const pagination = data.pagination;

    return {
      data: seriesArray,
      current_page: pagination?.current_page || filters?.page || 1,
      last_page: pagination?.last_page || 1,
      per_page: pagination?.per_page || filters?.per_page || 30,
      total: pagination?.total || seriesArray.length,
      first_page_url: '',
      from: seriesArray.length > 0 ? 1 : null,
      last_page_url: '',
      links: [],
      next_page_url: null,
      path: '',
      prev_page_url: null,
      to: seriesArray.length > 0 ? seriesArray.length : null,
    };
  },

  getAll: async (page = 1, perPage = 12): Promise<PaginatedResponse<Series>> => {
    const data = await apiClient.get<{
      message?: string;
      series?: Series[];
      pagination?: { total: number; per_page: number; current_page: number; last_page: number };
    }>('/series', {
      params: { page, per_page: perPage },
    });

    const seriesArray = data.series || [];
    const pagination = data.pagination;

    return {
      data: seriesArray,
      current_page: pagination?.current_page || page,
      last_page: pagination?.last_page || 1,
      per_page: pagination?.per_page || perPage,
      total: pagination?.total || seriesArray.length,
      first_page_url: '',
      from: seriesArray.length > 0 ? 1 : null,
      last_page_url: '',
      links: [],
      next_page_url: null,
      path: '',
      prev_page_url: null,
      to: seriesArray.length > 0 ? seriesArray.length : null,
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
