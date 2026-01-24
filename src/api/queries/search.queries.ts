/**
 * Search Query Hooks
 *
 * TanStack Query hooks for search-related data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { searchClient } from '../client/search.client';
import { queryKeys } from '../query-keys';

/**
 * Hook to search for videos, series, creators
 * Stale time: 5 minutes (search results can change frequently)
 */
export function useSearch(query: string | null | undefined, page = 1) {
  return useQuery({
    queryKey: queryKeys.search.query(query || '', { page }),
    queryFn: () => searchClient.search(query!, { page }),
    enabled: !!query && query.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

