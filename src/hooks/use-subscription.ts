'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { subscriptionsClient } from '@/api/client/subscriptions.client';
import { useAuthStore } from '@/shared/stores/auth-store';
import type { SubscriptionInfo, Plan } from '@/types';

/**
 * Hook for subscription entitlement checks and billing management
 *
 * IMPORTANT: This hook fetches state from the backend.
 * The backend is the ONLY source of truth for subscription state.
 * Never cache or persist subscription state client-side beyond this hook.
 */
export function useSubscription() {
  const { isAuthenticated, isSubscribed: authStoreSubscribed } = useAuthStore();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch subscription info from backend
   * Called on mount and can be called manually to refresh
   */
  const refreshSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      setSubscriptionInfo({ is_subscribed: false });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const info = await subscriptionsClient.getSubscriptionInfo();
      setSubscriptionInfo(info);
    } catch (err) {
      console.error('Failed to fetch subscription info:', err);
      setError('Failed to load subscription info');
      // Fallback to auth store state
      setSubscriptionInfo({ is_subscribed: authStoreSubscribed });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authStoreSubscribed]);

  // Fetch on mount and when auth state changes
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  /**
   * Check if user has active subscription
   * Uses backend state, falls back to auth store
   */
  const isSubscribed = subscriptionInfo?.is_subscribed ?? authStoreSubscribed;

  /**
   * Get the manage subscription URL (Whop, Apple, etc.)
   * Opens in new tab or returns URL for custom handling
   */
  const getManageUrl = useCallback((): string | null => {
    if (!subscriptionInfo?.manage_url) {
      // Fallback based on provider
      if (subscriptionInfo?.provider === 'apple') {
        return 'https://apps.apple.com/account/subscriptions';
      }
      if (subscriptionInfo?.provider === 'google') {
        return 'https://play.google.com/store/account/subscriptions';
      }
      return null;
    }
    return subscriptionInfo.manage_url;
  }, [subscriptionInfo]);

  /**
   * Open subscription management page
   */
  const openManageSubscription = useCallback(() => {
    const url = getManageUrl();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [getManageUrl]);

  return {
    // State
    isSubscribed,
    subscriptionInfo,
    loading,
    error,

    // Actions
    refreshSubscription,
    getManageUrl,
    openManageSubscription,

    // Computed
    provider: subscriptionInfo?.provider,
    plan: subscriptionInfo?.plan,
    status: subscriptionInfo?.status,
    currentPeriodEnd: subscriptionInfo?.current_period_end,
    manageUrl: subscriptionInfo?.manage_url,
  };
}

/**
 * Hook for fetching available plans
 */
export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const plansData = await subscriptionsClient.getPlans();
      // Filter to only active plans
      const activePlans = plansData.filter((p) => p.is_active !== false);
      setPlans(activePlans);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  /**
   * Get a specific plan by slug or interval
   */
  const getPlan = useCallback(
    (identifier: string | 'monthly' | 'yearly' | 'lifetime') => {
      return plans.find((p) => p.slug === identifier || p.interval === identifier);
    },
    [plans]
  );

  /**
   * Get Whop checkout URL for a plan
   * Returns null if plan doesn't have Whop URL
   */
  const getCheckoutUrl = useCallback((plan: Plan): string | null => {
    return plan.whop_plan_url || null;
  }, []);

  return {
    plans,
    loading,
    error,
    fetchPlans,
    getPlan,
    getCheckoutUrl,
  };
}

/**
 * Hook to require subscription for a page/component
 * Redirects to plans page if not subscribed
 */
export function useRequireSubscription(options?: { redirectTo?: string }) {
  const { isSubscribed, loading } = useSubscription();
  const { isAuthenticated } = useAuthStore();

  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated && !isSubscribed) {
      const redirectUrl = options?.redirectTo || '/choose-plan';
      router.push(redirectUrl);
    }
  }, [isSubscribed, loading, isAuthenticated, options?.redirectTo, router]);

  return {
    isSubscribed,
    loading,
    // Only show content when we've confirmed subscription
    canAccess: !loading && isSubscribed,
  };
}
