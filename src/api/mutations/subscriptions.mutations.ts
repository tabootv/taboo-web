/**
 * Subscriptions Mutation Hooks
 *
 * TanStack Query mutation hooks for subscription operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsClient } from '../client/subscriptions.client';
import { queryKeys } from '../query-keys';

/**
 * Hook to create subscription via Apple In-App Purchase
 */
export function useSubscribeApple() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (receipt: string) => subscriptionsClient.createApple(receipt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all });
    },
  });
}

/**
 * Hook to create subscription via Google Play
 */
export function useSubscribeGooglePlay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ purchaseToken, productId }: { purchaseToken: string; productId: string }) =>
      subscriptionsClient.createGooglePlay(purchaseToken, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all });
    },
  });
}
