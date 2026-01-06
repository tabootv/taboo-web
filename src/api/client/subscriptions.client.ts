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
    const data = await apiClient.get<{ plans?: Plan[]; data?: Plan[] } | Plan[]>('/plans/by-country', {
      params: { country } as Record<string, unknown>,
    });
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
        provider: data.provider,
        plan: data.plan,
        status: data.status,
        current_period_end: data.current_period_end,
        manage_url: data.manage_url,
      };
    } catch {
      try {
        const subscription = await subscriptionsClient.getSubscription();
        if (subscription) {
          return {
            is_subscribed: subscription.status === 'active',
            provider: subscription.provider,
            plan: subscription.plan?.slug || subscription.plan?.name,
            status: subscription.status,
            current_period_end: subscription.current_period_end || subscription.expires_at,
            manage_url: subscription.payload?.manage_url,
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

