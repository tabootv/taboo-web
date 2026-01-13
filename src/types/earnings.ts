/**
 * Earnings Types
 * Used for creator affiliate earnings tracking (FirstPromoter integration)
 */

export type DateRange = '7d' | '30d' | '90d' | '365d' | 'all';
export type GroupBy = 'day' | 'week' | 'month';

export interface Commission {
  id: number;
  status: string;
  saleAmount: number;
  commissionAmount: number;
  planId: string;
  referralEmail: string;
  rewardName: string;
  createdAt: string;
}

export interface Payout {
  id: number;
  status: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
  payoutMethod: string;
}

export interface EarningsData {
  promoter: {
    id: number;
    name: string;
    email: string;
    refId: string;
    referralLink: string;
    status: string;
    payoutMethod: string | null;
    joinedAt: string;
  };
  summary: {
    clicks: number;
    signups: number;
    customers: number;
    sales: number;
    revenue: number;
    earnings: number;
  };
  allTimeStats: {
    clicks: number;
    signups: number;
    customers: number;
    sales: number;
    revenue: number;
    earnings: number;
    activeCustomers: number;
  };
  balance: {
    current: number;
    pending: number;
    paid: number;
  };
  conversionRates: {
    clickToSignup: number;
    signupToCustomer: number;
  };
  series: Array<{
    period: string;
    earnings: number;
    revenue: number;
    count: number;
    clicks: number;
    signups: number;
    customers: number;
  }>;
  recentCommissions: Commission[];
  payoutHistory: Payout[];
  groupBy: GroupBy;
}

export interface EarningsParams {
  range: DateRange;
  groupBy: GroupBy;
}
