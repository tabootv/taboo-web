/**
 * Subscriptions API Client
 *
 * API Endpoints:
 * - GET /plans/list → Plan[]
 * - GET /plans/by-country → Plan[]
 * - GET /subscription/status → { is_subscribed: boolean }
 * - GET /subscription → BackendSubscriptionInfo
 * - POST /redeem-codes/validate → { valid: boolean, plan: Plan }
 * - POST /redeem-codes/apply → { message: string, subscribed: boolean }
 * - POST /subscription/create → Subscription (Apple)
 * - POST /subscription/google-play/create → Subscription (Google Play)
 */

import type { ApiResponse, Plan, Subscription, SubscriptionInfo } from '../types';
import type { BackendSubscriptionInfo } from '@/types/subscription';
import { apiClient } from './base-client';

export interface GetPlansParams {
  email?: string | undefined;
  ref?: string | undefined;
  country_code?: string | undefined;
}

export interface RedeemCodeValidateResponse {
  valid: boolean;
  plan?: Plan;
  message?: string;
}

export interface RedeemCodeApplyResponse {
  message: string;
  subscribed: boolean;
}

export interface InviteInfo {
  code: string;
  uses_count: number;
  max_uses: number;
  can_create_invite: boolean;
}

export interface MyInviteResponse {
  invite: InviteInfo | null;
  can_create_invite: boolean;
}

export interface CreateInviteResponse {
  invite: InviteInfo;
}

export const subscriptionsClient = {
  /**
   * Get all available plans with Whop checkout URLs
   */
  getPlans: async (params?: GetPlansParams): Promise<Plan[]> => {
    const queryParams: Record<string, unknown> = {};
    if (params?.email) queryParams.email = params.email;
    if (params?.ref) queryParams.ref = params.ref;
    if (params?.country_code) queryParams.country_code = params.country_code;

    const data = await apiClient.get<{ plans?: Plan[]; data?: Plan[] } | Plan[]>('/plans/list', {
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
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
   * Get full subscription details from backend
   */
  getSubscription: async (): Promise<BackendSubscriptionInfo | null> => {
    try {
      const data = await apiClient.get<
        BackendSubscriptionInfo | ApiResponse<Subscription> | Subscription
      >('/subscription');
      // Handle BackendSubscriptionInfo shape (flat with provider, status, start_at, end_at, manage_url)
      if (data && typeof data === 'object' && 'start_at' in data) {
        return data as BackendSubscriptionInfo;
      }
      // Handle ApiResponse<Subscription> wrapper
      if (data && typeof data === 'object' && 'data' in data) {
        const sub = (data as ApiResponse<Subscription>).data;
        return {
          provider: sub.provider || null,
          status: sub.status || null,
          start_at: sub.starts_at || null,
          end_at: sub.expires_at || null,
          manage_url: sub.payload?.manage_url || null,
        };
      }
      // Handle raw Subscription shape
      const sub = data as Subscription;
      if (sub && sub.provider) {
        return {
          provider: sub.provider || null,
          status: sub.status || null,
          start_at: sub.starts_at || null,
          end_at: sub.expires_at || null,
          manage_url: sub.payload?.manage_url || null,
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Get subscription info with manage_url for billing page
   * Derives from getSubscription()
   */
  getSubscriptionInfo: async (): Promise<SubscriptionInfo> => {
    try {
      const sub = await subscriptionsClient.getSubscription();
      if (sub) {
        return {
          is_subscribed: sub.status === 'active',
          ...(sub.provider && { provider: sub.provider as SubscriptionInfo['provider'] }),
          ...(sub.status && { status: sub.status as SubscriptionInfo['status'] }),
          ...(sub.end_at && { current_period_end: sub.end_at }),
          ...(sub.manage_url && { manage_url: sub.manage_url }),
        };
      }
      return { is_subscribed: false };
    } catch {
      return { is_subscribed: false };
    }
  },

  /**
   * Validate a redeem code
   */
  validateRedeemCode: async (code: string): Promise<RedeemCodeValidateResponse> => {
    return apiClient.post<RedeemCodeValidateResponse>('/redeem-codes/validate', { code });
  },

  /**
   * Apply a redeem code to activate subscription
   */
  applyRedeemCode: async (code: string): Promise<RedeemCodeApplyResponse> => {
    return apiClient.post<RedeemCodeApplyResponse>('/redeem-codes/apply', { code });
  },

  /**
   * Get the current user's invite code (if any)
   */
  getMyInvite: async (): Promise<MyInviteResponse> => {
    return apiClient.get<MyInviteResponse>('/redeem-codes/my-invite');
  },

  /**
   * Generate a new invite code
   */
  createInvite: async (): Promise<CreateInviteResponse> => {
    return apiClient.post<CreateInviteResponse>('/redeem-codes/create-invite', {});
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
