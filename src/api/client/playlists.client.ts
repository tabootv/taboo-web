/**
 * Playlists API Client
 *
 * API Endpoints:
 * - GET /playlists → PaginatedResponse<Playlist>
 * - GET /playlists/{id} → Playlist & { videos: PaginatedResponse<Video> }
 */

import type { PaginatedResponse, Playlist, Video } from '../types';
import { apiClient } from './base-client';

export interface PlaylistsListFilters extends Record<string, unknown> {
  page?: number;
  per_page?: number;
}

export interface PlaylistDetail extends Omit<Playlist, 'videos'> {
  videos: PaginatedResponse<Video>;
}

export const playlistsClient = {
  /**
   * Get paginated list of playlists
   */
  list: async (
    filters?: PlaylistsListFilters,
    serverToken?: string
  ): Promise<PaginatedResponse<Playlist>> => {
    const data = await apiClient.get<{
      data?: PaginatedResponse<Playlist>;
    }>('/playlists', {
      params: filters,
      ...(serverToken ? { serverToken } : {}),
    });
    return data.data || (data as unknown as PaginatedResponse<Playlist>);
  },

  /**
   * Get a single playlist with its videos
   */
  get: async (id: number, page = 1): Promise<PlaylistDetail> => {
    const data = await apiClient.get<{
      data?: PlaylistDetail;
    }>(`/playlists/${id}`, {
      params: { page },
    });
    return data.data || (data as unknown as PlaylistDetail);
  },
};
