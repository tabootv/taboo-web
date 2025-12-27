/**
 * Subscriptions Query Hooks
 *
 * TanStack Query hooks for subscription-related data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { subscriptionsClient } from '../client';
import { queryKeys } from '../query-keys';

/**
 * Hook to fetch all available plans
 */
export function usePlans() {
  return useQuery({
    queryKey: queryKeys.subscription.plans(),
    queryFn: () => subscriptionsClient.getPlans(),
    staleTime: 1000 * 60 * 60, // 1 hour (plans rarely change)
  });
}

/**
 * Hook to fetch plans by country
 */
export function usePlansByCountry(country?: string) {
  return useQuery({
    queryKey: queryKeys.subscription.plansByCountry(country),
    queryFn: () => subscriptionsClient.getPlansByCountry(country),
    enabled: !!country,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch subscription status
 */
export function useSubscriptionStatus() {
  return useQuery({
    queryKey: queryKeys.subscription.status(),
    queryFn: () => subscriptionsClient.getStatus(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch full subscription details
 */
export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.subscription.detail(),
    queryFn: () => subscriptionsClient.getSubscription(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch subscription info with manage_url
 */
export function useSubscriptionInfo() {
  return useQuery({
    queryKey: queryKeys.subscription.info(),
    queryFn: () => subscriptionsClient.getSubscriptionInfo(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

