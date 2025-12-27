/**
 * Search API Client
 *
 * API Endpoints:
 * - GET /search?q={query} → SearchResults
 */

import type { SearchResults } from '../types';
import { apiClient } from './base-client';

export interface SearchFilters {
  q: string;
  page?: number;
}

export const searchClient = {
  /**
   * Search for videos, series, creators
   */
  search: async (query: string, params?: { page?: number }): Promise<SearchResults> => {
    const { data } = await apiClient.get('/search', { params: { q: query, ...params } });
    return data.results || data;
  },
};

