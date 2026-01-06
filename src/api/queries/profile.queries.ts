/**
 * Profile Query Hooks
 *
 * TanStack Query hooks for profile-related data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { profileClient } from '../client';

/**
 * Hook to fetch user profile
 * Stale time: 5 minutes (profile can change)
 */
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileClient.get(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

