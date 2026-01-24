/**
 * Authentication Query Hooks
 *
 * TanStack Query hooks for authentication-related data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { authClient } from '../client/auth.client';
import { queryKeys } from '../query-keys';

/**
 * Hook to fetch current user data
 *
 * Stale time: 1 minute (user data changes infrequently)
 * Cache time: 5 minutes
 */
export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authClient.me(),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}
