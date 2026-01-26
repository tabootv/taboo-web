/**
 * Subscriptions API Client
 *
 * API Endpoints:
 * - GET /plans/list → Plan[]
 * - GET /plans/by-country → Plan[]
 * - GET /subscription/status → { is_subscribed: boolean }
 * - GET /subscription → Subscription
 * - GET /subscription-info → SubscriptionInfo
 * - POST /subscription/create → Subscription (Apple)
 * - POST /subscription/google-play/create → Subscription (Google Play)
 */

import type { ApiResponse, Plan, Subscription, SubscriptionInfo } from '../types';
import { apiClient } from './base-client';

export const subscriptionsClient = {
  /**
   * Get all available plans with Whop checkout URLs
   */
  getPlans: async (): Promise<Plan[]> => {
    const data = await apiClient.get<{ plans?: Plan[]; data?: Plan[] } | Plan[]>('/plans/list');
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      if ('plans' in data && Array.isArray(data.plans)) return data.plans;
      if ('data' in data && Array.isArray(data.data)) return data.data;
    }
    return [];
  },

  /**
   * Get plans filtered by country (for regional pricing)
   */
  getPlansByCountry: async (country?: string): Promise<Plan[]> => {
    const data = await apiClient.get<{ plans?: Plan[]; data?: Plan[] } | Plan[]>(
      '/plans/by-country',
      {
        params: { country } as Record<string, unknown>,
      }
    );
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      if ('plans' in data && Array.isArray(data.plans)) return data.plans;
      if ('data' in data && Array.isArray(data.data)) return data.data;
    }
    return [];
  },

  /**
   * Quick subscription status check
   */
  getStatus: async (): Promise<{ is_subscribed: boolean }> => {
    const data = await apiClient.get<{ is_subscribed?: boolean; subscribed?: boolean }>(
      '/subscription/status'
    );
    return { is_subscribed: data.is_subscribed || data.subscribed || false };
  },

  /**
   * Get full subscription details including manage_url
   */
  getSubscription: async (): Promise<Subscription | null> => {
    try {
      const data = await apiClient.get<ApiResponse<Subscription> | Subscription>('/subscription');
      if (data && typeof data === 'object' && 'data' in data) {
        return (data as ApiResponse<Subscription>).data;
      }
      return data as Subscription;
    } catch {
      return null;
    }
  },

  /**
   * Get subscription info with manage_url for billing page
   */
  getSubscriptionInfo: async (): Promise<SubscriptionInfo> => {
    try {
      const data = await apiClient.get<SubscriptionInfo>('/subscription-info');
      return {
        is_subscribed: data.is_subscribed ?? false,
        ...(data.provider && { provider: data.provider }),
        ...(data.plan && { plan: data.plan }),
        ...(data.status && { status: data.status }),
        ...(data.current_period_end && { current_period_end: data.current_period_end }),
        ...(data.manage_url && { manage_url: data.manage_url }),
      };
    } catch {
      try {
        const subscription = await subscriptionsClient.getSubscription();
        if (subscription) {
          const plan = subscription.plan?.slug || subscription.plan?.name;
          const periodEnd = subscription.current_period_end || subscription.expires_at;
          const manageUrl = subscription.payload?.manage_url;
          return {
            is_subscribed: subscription.status === 'active',
            ...(subscription.provider && { provider: subscription.provider }),
            ...(plan && { plan }),
            ...(subscription.status && { status: subscription.status }),
            ...(periodEnd && { current_period_end: periodEnd }),
            ...(manageUrl && { manage_url: manageUrl }),
          };
        }
      } catch {
        // Ignore
      }
      return { is_subscribed: false };
    }
  },

  /**
   * Create subscription via Apple In-App Purchase
   */
  createApple: async (receipt: string): Promise<Subscription> => {
    const data = await apiClient.post<ApiResponse<Subscription>>('/subscription/create', {
      receipt,
    });
    return data.data;
  },

  /**
   * Create subscription via Google Play
   */
  createGooglePlay: async (purchaseToken: string, productId: string): Promise<Subscription> => {
    const data = await apiClient.post<ApiResponse<Subscription>>(
      '/subscription/google-play/create',
      {
        purchase_token: purchaseToken,
        product_id: productId,
      }
    );
    return data.data;
  },
};
