/**
 * Server-only FirstPromoter API client
 * NEVER import this file in client components
 * Uses V1 API for profile/rewards and V2 API for date-filtered reports
 */

import { getRequiredEnv } from '@/shared/lib/config/env';

const FIRSTPROMOTER_API_KEY = getRequiredEnv('FIRSTPROMOTER_API_KEY');
const FIRSTPROMOTER_ACCOUNT_ID = getRequiredEnv('FIRSTPROMOTER_ACCOUNT_ID');
const V1_BASE_URL = getRequiredEnv('FIRSTPROMOTER_V1_API_URL');
const V2_BASE_URL = getRequiredEnv('FIRSTPROMOTER_V2_API_URL');

// Ensure this module is only used on the server
if (globalThis.window !== undefined) {
  throw new TypeError('FirstPromoter client must only be used on the server');
}

function getV1Headers(): HeadersInit {
  return {
    Authorization: `Bearer ${FIRSTPROMOTER_API_KEY}`,
    Accept: 'application/json',
  };
}

function getV2Headers(): HeadersInit {
  return {
    Authorization: `Bearer ${FIRSTPROMOTER_API_KEY}`,
    'Account-ID': FIRSTPROMOTER_ACCOUNT_ID,
    Accept: 'application/json',
  };
}

// Types for FirstPromoter V1 API responses
export interface PromoterPromotion {
  id: number;
  status: string;
  ref_id: string;
  campaign_name: string;
  referral_link: string;
  visitors_count: number;
  leads_count: number;
  customers_count: number;
  sales_count: number;
  sales_total: number;
  refunds_count: number;
  refunds_total: number;
  active_customers_count: number;
}

export interface PromoterV1Response {
  id: number;
  status: string;
  email: string;
  created_at: string;
  default_ref_id: string;
  earnings_balance?: { cash: number };
  current_balance?: { cash: number };
  paid_balance?: { cash: number } | null;
  auth_token: string;
  profile?: {
    id: number;
    first_name: string;
    last_name: string;
    website?: string;
    paypal_email?: string;
  };
  promotions: PromoterPromotion[];
}

export interface RewardV1Response {
  id: number;
  status: string;
  amount: number; // in cents
  unit: string;
  created_at: string;
  conversion_amount: number; // sale amount in cents
  tier_level: number;
  lead?: {
    id: number;
    state: string;
    email: string;
    customer_since?: string;
    plan_name?: string;
  };
  promotion?: {
    campaign_name: string;
  };
}

// Normalized output types
export interface PromoterProfile {
  id: number;
  email: string;
  name: string;
  status: string;
  refId: string;
  stats: {
    clicks: number;
    signups: number;
    customers: number;
    sales: number;
    revenue: number; // in cents
    earnings: number; // in cents
  };
  balance: {
    current: number; // in cents
    paid: number; // in cents
  };
}

export interface RewardDataPoint {
  date: string;
  earnings: number; // in cents
  revenue: number; // in cents
  count: number;
}

export type GroupBy = 'day' | 'week' | 'month' | 'year';

export interface ReportParams {
  promoterId: number;
  startDate: string;
  endDate: string;
  groupBy: GroupBy;
}

// V2 Reports API types
export interface V2ReportData {
  clicks_count: number;
  referrals_count: number;
  customers_count: number;
  sales_count: number;
  revenue_amount: number;
}

export interface V2ReportResponse {
  promoter: { id: number; email: string; name: string };
  id: number;
  data: V2ReportData;
  sub_data: Array<{
    period: string;
    id: string;
    data: V2ReportData;
  }>;
}

// V2 Promoter Profile types
export interface V2PromoterProfile {
  id: number;
  email: string;
  name: string;
  stats: {
    clicks_count: number;
    referrals_count: number;
    sales_count: number;
    customers_count: number;
    revenue_amount: number;
    active_customers_count: number;
  };
  balances: {
    current_balance: { cash: number };
    pending_balance: { cash: number };
    earnings_balance: { cash: number };
    remaining_balance: { cash: number };
  };
  profile: {
    id: number;
    first_name: string;
    last_name: string;
    website?: string;
    paypal_email?: string;
    avatar?: string;
  };
  promoter_campaigns: Array<{
    id: number;
    campaign_id: number;
    ref_token: string;
    ref_link: string;
    campaign: {
      id: number;
      name: string;
    };
    stats: {
      clicks_count: number;
      referrals_count: number;
      sales_count: number;
      customers_count: number;
      revenue_amount: number;
    };
  }>;
  selected_payout_method?: {
    id: number;
    method: string;
    is_disabled: boolean;
  };
  joined_at: string;
  first_event_at?: string;
  last_login_at?: string;
}

// V2 Commission types
export interface V2Commission {
  id: number;
  status: 'pending' | 'approved' | 'denied' | 'paid';
  commission_type: string;
  sale_amount: number; // in cents
  amount: number; // commission amount in cents
  is_paid: boolean;
  created_at: string;
  plan_id?: string;
  tier: number;
  fraud_check: string;
  referral: {
    id: number;
    email: string;
    uid?: string;
  };
  reward: {
    id: number;
    name: string;
  };
}

// V2 Referral types
export interface V2Referral {
  id: number;
  email: string;
  state: 'signup' | 'customer' | 'cancelled';
  created_at: string;
  customer_since?: string;
  fraud_check: string;
  is_expired: boolean;
}

// V2 Payout types
export interface V2Payout {
  id: number;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  amount: number; // in cents
  period_start: string;
  period_end: string;
  paid_at?: string;
  created_at: string;
  payout_method: {
    id: number;
    method: string;
    is_disabled: boolean;
  };
}

/**
 * Get promoter profile and lifetime stats from V1 API
 */
export async function getPromoterProfile(promoterId: number): Promise<PromoterProfile | null> {
  try {
    const response = await fetch(`${V1_BASE_URL}/promoters/show?id=${promoterId}`, {
      method: 'GET',
      headers: getV1Headers(),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(
        'FirstPromoter getPromoterProfile error:',
        response.status,
        await response.text()
      );
      return null;
    }

    const data: PromoterV1Response = await response.json();

    // Aggregate stats from all promotions
    const totalStats = data.promotions.reduce(
      (acc, promo) => ({
        clicks: acc.clicks + (promo.visitors_count || 0),
        signups: acc.signups + (promo.leads_count || 0),
        customers: acc.customers + (promo.customers_count || 0),
        sales: acc.sales + (promo.sales_count || 0),
        revenue: acc.revenue + (promo.sales_total || 0),
      }),
      { clicks: 0, signups: 0, customers: 0, sales: 0, revenue: 0 }
    );

    // Build normalized profile
    const name =
      data.profile?.first_name && data.profile?.last_name
        ? `${data.profile.first_name} ${data.profile.last_name}`.trim()
        : data.profile?.first_name || data.email.split('@')[0] || 'Unknown';

    return {
      id: data.id,
      email: data.email,
      name,
      status: data.status,
      refId: data.default_ref_id,
      stats: {
        ...totalStats,
        earnings: data.earnings_balance?.cash || data.current_balance?.cash || 0,
      },
      balance: {
        current: data.current_balance?.cash || 0,
        paid: data.paid_balance?.cash || 0,
      },
    };
  } catch (error) {
    console.error('FirstPromoter getPromoterProfile exception:', error);
    return null;
  }
}

/**
 * Get date-filtered reports from V2 API
 * Returns clicks, signups, customers, sales, revenue filtered by date range
 */
export async function getPromoterReports(
  promoterId: number,
  startDate: string,
  endDate: string,
  groupBy: GroupBy
): Promise<V2ReportResponse | null> {
  try {
    // Format dates as YYYY-MM-DD for the API
    const startDateStr = new Date(startDate).toISOString().split('T')[0];
    const endDateStr = new Date(endDate).toISOString().split('T')[0];

    const columns = 'clicks_count,referrals_count,customers_count,sales_count,revenue_amount';
    const url = `${V2_BASE_URL}/reports/promoters?promoter_id=${promoterId}&start_date=${startDateStr}&end_date=${endDateStr}&group_by=${groupBy}&columns=${columns}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getV2Headers(),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(
        'FirstPromoter getPromoterReports error:',
        response.status,
        await response.text()
      );
      return null;
    }

    const data = await response.json();
    // API returns an array, we want the first (and only) item for single promoter
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('FirstPromoter getPromoterReports exception:', error);
    return null;
  }
}

/**
 * Get rewards list for time series data (with pagination to fetch ALL records)
 */
export async function getRewardsList(promoterId: number): Promise<RewardV1Response[]> {
  const allRewards: RewardV1Response[] = [];
  let page = 1;
  const perPage = 100;

  try {
    while (true) {
      const response = await fetch(
        `${V1_BASE_URL}/rewards/list?promoter_id=${promoterId}&page=${page}&per_page=${perPage}`,
        {
          method: 'GET',
          headers: getV1Headers(),
          next: { revalidate: 60 },
        }
      );

      if (!response.ok) {
        console.error(
          'FirstPromoter getRewardsList error:',
          response.status,
          await response.text()
        );
        break;
      }

      const pageData = await response.json();
      if (!pageData || pageData.length === 0) break;

      allRewards.push(...pageData);

      // If we got less than perPage, we've reached the last page
      if (pageData.length < perPage) break;
      page++;
    }
  } catch (error) {
    console.error('FirstPromoter getRewardsList exception:', error);
  }

  return allRewards;
}

/**
 * Get date string in YYYY-MM-DD format (ignoring time)
 */
function toDateString(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

/**
 * Group rewards by time period
 */
function groupRewardsByPeriod(
  rewards: RewardV1Response[],
  groupBy: GroupBy,
  startDate: string,
  endDate: string
): RewardDataPoint[] {
  // Parse dates and normalize to start of day for comparison
  const startStr = toDateString(new Date(startDate));
  const endStr = toDateString(new Date(endDate));

  // Filter rewards within date range (using date strings for reliable comparison)
  const filtered = rewards.filter((r) => {
    const dateStr = toDateString(new Date(r.created_at));
    return dateStr >= startStr && dateStr <= endStr;
  });

  // Group by period
  const grouped = new Map<string, { earnings: number; revenue: number; count: number }>();

  filtered.forEach((reward) => {
    const date = new Date(reward.created_at);
    let key: string;

    switch (groupBy) {
      case 'day':
        key = toDateString(date);
        break;
      case 'week': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = toDateString(weekStart);
        break;
      }
      case 'month':
        // Use first day of month for proper date parsing
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
        break;
      case 'year':
        // Use first day of year for proper date parsing
        key = `${date.getFullYear()}-01-01`;
        break;
    }

    const existing = grouped.get(key) || { earnings: 0, revenue: 0, count: 0 };
    grouped.set(key, {
      earnings: existing.earnings + (reward.amount || 0),
      revenue: existing.revenue + (reward.conversion_amount || 0),
      count: existing.count + 1,
    });
  });

  // Convert to array and sort
  return Array.from(grouped.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Filter rewards by date range and calculate summary stats
 */
function getFilteredRewardsStats(
  rewards: RewardV1Response[],
  startDate: string,
  endDate: string
): { sales: number; revenue: number; earnings: number; customers: number } {
  const startStr = toDateString(new Date(startDate));
  const endStr = toDateString(new Date(endDate));

  // Filter rewards within date range
  const filtered = rewards.filter((r) => {
    const dateStr = toDateString(new Date(r.created_at));
    return dateStr >= startStr && dateStr <= endStr;
  });

  // Calculate stats from filtered rewards
  const uniqueCustomers = new Set<number>();
  let totalEarnings = 0;
  let totalRevenue = 0;

  filtered.forEach((reward) => {
    totalEarnings += reward.amount || 0;
    totalRevenue += reward.conversion_amount || 0;
    if (reward.lead?.id) {
      uniqueCustomers.add(reward.lead.id);
    }
  });

  return {
    sales: filtered.length,
    revenue: totalRevenue,
    earnings: totalEarnings,
    customers: uniqueCustomers.size,
  };
}

/**
 * Get promoter earnings data with time series
 * Uses V2 API for date-filtered stats (clicks, signups, customers, sales, revenue)
 * and V1 rewards list for earnings calculation
 */
export async function getPromoterEarningsData(params: ReportParams) {
  const [profile, rewards, v2Reports] = await Promise.all([
    getPromoterProfile(params.promoterId),
    getRewardsList(params.promoterId),
    getPromoterReports(params.promoterId, params.startDate, params.endDate, params.groupBy),
  ]);

  const series = groupRewardsByPeriod(rewards, params.groupBy, params.startDate, params.endDate);

  // Calculate earnings from rewards (V2 API doesn't provide earnings column)
  const rewardsStats = getFilteredRewardsStats(rewards, params.startDate, params.endDate);

  // Combine V2 reports (date-filtered) with rewards-based earnings
  const filteredStats = {
    clicks: v2Reports?.data.clicks_count || 0,
    signups: v2Reports?.data.referrals_count || 0,
    customers: v2Reports?.data.customers_count || rewardsStats.customers,
    sales: v2Reports?.data.sales_count || rewardsStats.sales,
    revenue: v2Reports?.data.revenue_amount || rewardsStats.revenue,
    earnings: rewardsStats.earnings, // Always from rewards list
  };

  return { profile, series, rawRewards: rewards, filteredStats, v2Reports };
}

/**
 * Get enhanced promoter profile from V2 API
 * Returns more detailed stats including active customers, pending balance, referral link
 */
export async function getPromoterProfileV2(promoterId: number): Promise<V2PromoterProfile | null> {
  try {
    const response = await fetch(`${V2_BASE_URL}/promoters/${promoterId}`, {
      method: 'GET',
      headers: getV2Headers(),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(
        'FirstPromoter getPromoterProfileV2 error:',
        response.status,
        await response.text()
      );
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('FirstPromoter getPromoterProfileV2 exception:', error);
    return null;
  }
}

/**
 * Get commissions list from V2 API (with pagination)
 */
export async function getCommissionsList(
  promoterId: number,
  options: { page?: number; perPage?: number; startDate?: string; endDate?: string } = {}
): Promise<{ commissions: V2Commission[]; total: number }> {
  const { page = 1, perPage = 20, startDate, endDate } = options;

  try {
    let url = `${V2_BASE_URL}/commissions?promoter_id=${promoterId}&page=${page}&per_page=${perPage}`;

    if (startDate) {
      url += `&start_date=${new Date(startDate).toISOString().split('T')[0]}`;
    }
    if (endDate) {
      url += `&end_date=${new Date(endDate).toISOString().split('T')[0]}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getV2Headers(),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(
        'FirstPromoter getCommissionsList error:',
        response.status,
        await response.text()
      );
      return { commissions: [], total: 0 };
    }

    const data = await response.json();
    return {
      commissions: Array.isArray(data) ? data : [],
      total: Array.isArray(data) ? data.length : 0,
    };
  } catch (error) {
    console.error('FirstPromoter getCommissionsList exception:', error);
    return { commissions: [], total: 0 };
  }
}

/**
 * Get referrals list from V2 API (with pagination)
 */
export async function getReferralsList(
  promoterId: number,
  options: { page?: number; perPage?: number; state?: string } = {}
): Promise<V2Referral[]> {
  const { page = 1, perPage = 20, state } = options;

  try {
    let url = `${V2_BASE_URL}/referrals?promoter_id=${promoterId}&page=${page}&per_page=${perPage}`;
    if (state) {
      url += `&state=${state}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getV2Headers(),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(
        'FirstPromoter getReferralsList error:',
        response.status,
        await response.text()
      );
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('FirstPromoter getReferralsList exception:', error);
    return [];
  }
}

/**
 * Get payouts list from V2 API (with pagination)
 */
export async function getPayoutsList(
  promoterId: number,
  options: { page?: number; perPage?: number } = {}
): Promise<V2Payout[]> {
  const { page = 1, perPage = 20 } = options;

  try {
    const url = `${V2_BASE_URL}/payouts?promoter_id=${promoterId}&page=${page}&per_page=${perPage}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getV2Headers(),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error('FirstPromoter getPayoutsList error:', response.status, await response.text());
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('FirstPromoter getPayoutsList exception:', error);
    return [];
  }
}

/**
 * Get comprehensive earnings data with all V2 API data
 */
export async function getComprehensiveEarningsData(params: ReportParams) {
  const [profileV2, rewards, v2Reports, commissions, payouts] = await Promise.all([
    getPromoterProfileV2(params.promoterId),
    getRewardsList(params.promoterId),
    getPromoterReports(params.promoterId, params.startDate, params.endDate, params.groupBy),
    getCommissionsList(params.promoterId, {
      perPage: 10,
      startDate: params.startDate,
      endDate: params.endDate,
    }),
    getPayoutsList(params.promoterId, { perPage: 10 }),
  ]);

  const series = groupRewardsByPeriod(rewards, params.groupBy, params.startDate, params.endDate);
  const rewardsStats = getFilteredRewardsStats(rewards, params.startDate, params.endDate);

  // Combine V2 reports (date-filtered) with rewards-based earnings
  const filteredStats = {
    clicks: v2Reports?.data.clicks_count || 0,
    signups: v2Reports?.data.referrals_count || 0,
    customers: v2Reports?.data.customers_count || rewardsStats.customers,
    sales: v2Reports?.data.sales_count || rewardsStats.sales,
    revenue: v2Reports?.data.revenue_amount || rewardsStats.revenue,
    earnings: rewardsStats.earnings,
  };

  // Build enhanced profile from V2 data
  const profile = profileV2
    ? {
        id: profileV2.id,
        email: profileV2.email,
        name:
          profileV2.name?.trim() || profileV2.profile?.first_name || profileV2.email.split('@')[0],
        status: 'active',
        refId: profileV2.promoter_campaigns?.[0]?.ref_token || '',
        referralLink: profileV2.promoter_campaigns?.[0]?.ref_link || '',
        stats: {
          clicks: profileV2.stats.clicks_count,
          signups: profileV2.stats.referrals_count,
          customers: profileV2.stats.customers_count,
          sales: profileV2.stats.sales_count,
          revenue: profileV2.stats.revenue_amount,
          earnings: profileV2.balances.earnings_balance?.cash || 0,
          activeCustomers: profileV2.stats.active_customers_count,
        },
        balance: {
          current: profileV2.balances.current_balance?.cash || 0,
          pending: profileV2.balances.pending_balance?.cash || 0,
          paid:
            (profileV2.balances.earnings_balance?.cash || 0) -
            (profileV2.balances.current_balance?.cash || 0),
        },
        payoutMethod: profileV2.selected_payout_method?.method || null,
        joinedAt: profileV2.joined_at,
      }
    : null;

  return {
    profile,
    series,
    filteredStats,
    recentCommissions: commissions.commissions,
    payoutHistory: payouts,
    v2Reports,
  };
}
