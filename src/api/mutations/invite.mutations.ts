/**
 * Invite Mutation Hooks
 *
 * TanStack Query mutation hooks for invite operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsClient } from '../client/subscriptions.client';
import { queryKeys } from '../query-keys';

/**
 * Hook to generate a new invite code
 */
export function useCreateInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionsClient.createInvite(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invite.all });
    },
  });
}
