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
    const data = await apiClient.get<{ results?: SearchResults } | SearchResults>('/search', {
      params: { q: query, ...params } as Record<string, unknown>,
    });
    return typeof data === 'object' && data !== null && 'results' in data
      ? data.results || data
      : (data as SearchResults);
  },
};
