/**
 * Subscription & Plan Types
 * Subscription management and payment plans
 */

export type SubscriptionProvider = 'whop' | 'apple' | 'google' | 'copecart' | 'stripe';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'past_due' | 'pending';
export type PlanInterval = 'monthly' | 'yearly' | 'lifetime';

export interface Plan {
  id: number;
  name: string;
  slug?: string;
  badge?: string;
  description?: string;
  price: number;
  currency: string;
  interval: PlanInterval;
  features?: string[];
  is_active?: boolean;
  whop_plan_id?: string;
  whop_plan_url?: string;
  apple_product_id?: string;
  google_product_id?: string;
}

export interface PlansResponse {
  message: string;
  plans: Plan[];
}

export interface Subscription {
  id: number;
  uuid: string;
  user_id: number;
  plan_id: number;
  provider: SubscriptionProvider;
  provider_subscription_id?: string;
  status: SubscriptionStatus;
  starts_at: string;
  expires_at: string;
  current_period_end?: string;
  plan?: Plan;
  payload?: {
    manage_url?: string;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}

export interface SubscriptionInfo {
  is_subscribed: boolean;
  provider?: SubscriptionProvider | undefined;
  plan?: string | undefined;
  status?: SubscriptionStatus | undefined;
  current_period_end?: string | undefined;
  manage_url?: string | undefined;
}

export interface SubscriptionStatusResponse {
  message: string;
  subscribed: boolean;
}
