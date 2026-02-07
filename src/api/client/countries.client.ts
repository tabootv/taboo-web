/**
 * Countries API Client
 *
 * API Endpoints:
 * - GET /countries → Country[]
 */

import { apiClient } from './base-client';

export interface Country {
  id: number;
  name: string;
  iso: string;
  emoji: string;
  videos_count: number;
}

export const countriesClient = {
  /**
   * Get list of all countries
   * Public endpoint, no auth required
   */
  list: async (): Promise<Country[]> => {
    const data = await apiClient.get<{ data?: Country[] } | Country[]>('/countries');
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  },
};
