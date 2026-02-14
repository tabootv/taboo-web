/**
 * Invite Query Hooks
 *
 * TanStack Query hooks for invite-related data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { subscriptionsClient } from '../client/subscriptions.client';
import { queryKeys } from '../query-keys';

/**
 * Hook to fetch the current user's invite code
 */
export function useMyInvite() {
  return useQuery({
    queryKey: queryKeys.invite.myInvite(),
    queryFn: () => subscriptionsClient.getMyInvite(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
