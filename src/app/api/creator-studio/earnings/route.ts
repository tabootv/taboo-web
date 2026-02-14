import {
  getComprehensiveEarningsData,
  type GroupBy,
  type V2Commission,
  type V2Payout,
} from '@/shared/lib/firstpromoter/client';
import { getRequiredEnv } from '@/shared/lib/config/env';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createApiLogger } from '@/shared/lib/logger';

const log = createApiLogger('/api/creator-studio/earnings', 'GET');

// Hardcoded promoter ID mapping for now
// TODO: Replace with database lookup once Laravel backend is ready
const PROMOTER_ID_MAP: Record<string, number> = {
  'arab@taboo.tv': 10448915,
};

// Default promoter ID for testing
const DEFAULT_PROMOTER_ID = 10448915;

export interface EarningsResponse {
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
  // Filtered summary based on selected date range (from V2 Reports API)
  summary: {
    clicks: number;
    signups: number;
    customers: number;
    sales: number;
    revenue: number; // in cents
    earnings: number; // in cents
  };
  // All-time stats from profile
  allTimeStats: {
    clicks: number;
    signups: number;
    customers: number;
    sales: number;
    revenue: number; // in cents
    earnings: number; // in cents
    activeCustomers: number;
  };
  balance: {
    current: number; // in cents
    pending: number; // in cents
    paid: number; // in cents
  };
  // Conversion rates (calculated)
  conversionRates: {
    clickToSignup: number; // percentage
    signupToCustomer: number; // percentage
  };
  series: Array<{
    period: string;
    earnings: number; // in cents
    revenue: number; // in cents
    count: number;
    // Funnel metrics (from V2 Reports API)
    clicks: number;
    signups: number;
    customers: number;
  }>;
  // Recent commissions
  recentCommissions: Array<{
    id: number;
    status: string;
    saleAmount: number;
    commissionAmount: number;
    planId: string;
    referralEmail: string;
    rewardName: string;
    createdAt: string;
  }>;
  // Payout history
  payoutHistory: Array<{
    id: number;
    status: string;
    amount: number;
    periodStart: string;
    periodEnd: string;
    paidAt: string | null;
    payoutMethod: string;
  }>;
  groupBy: GroupBy;
}

interface V2ReportSubData {
  period: string;
  id: string;
  data: {
    clicks_count: number;
    referrals_count: number;
    customers_count: number;
    sales_count: number;
    revenue_amount: number;
  };
}

interface V2ReportResponse {
  sub_data?: V2ReportSubData[];
}

interface RewardDataPoint {
  date: string;
  earnings: number;
  revenue: number;
  count: number;
}

/**
 * Safely parse a date string into YYYY-MM-DD format
 * Handles various formats like "Dec 23, 2025", "2025-12-23", "Week 52, 2025", etc.
 */
function safeParseDateToString(dateStr: string): string | null {
  try {
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    // Try to parse the date
    const parsedDate = new Date(dateStr);

    // Check if the date is valid
    if (isNaN(parsedDate.getTime())) {
      console.warn('Could not parse date:', dateStr);
      return null;
    }

    const isoDate = parsedDate.toISOString().split('T')[0];
    return isoDate ?? null;
  } catch (error) {
    console.warn('Error parsing date:', dateStr, error);
    return null;
  }
}

/**
 * Merge earnings data from rewards with funnel metrics from V2 Reports API
 */
function mergeFunnelData(
  earningsSeries: RewardDataPoint[],
  v2Reports: V2ReportResponse | null
): EarningsResponse['series'] {
  // Create a map of V2 funnel data by normalized date
  const funnelMap = new Map<
    string,
    { clicks: number; signups: number; customers: number; revenue: number }
  >();

  if (v2Reports?.sub_data) {
    for (const item of v2Reports.sub_data) {
      // V2 API returns dates in various formats - safely parse them
      const normalizedDate = safeParseDateToString(item.period);

      if (normalizedDate) {
        funnelMap.set(normalizedDate, {
          clicks: item.data.clicks_count || 0,
          signups: item.data.referrals_count || 0,
          customers: item.data.customers_count || 0,
          revenue: item.data.revenue_amount || 0,
        });
      }
    }
  }

  // Get all unique dates from both sources
  const allDates = new Set<string>();
  earningsSeries.forEach((item) => allDates.add(item.date));
  funnelMap.forEach((_, date) => allDates.add(date));

  // Merge data for each date
  const mergedData = Array.from(allDates)
    .map((date) => {
      const earningsData = earningsSeries.find((e) => e.date === date);
      const funnelData = funnelMap.get(date);

      return {
        period: date,
        earnings: earningsData?.earnings || 0,
        revenue: funnelData?.revenue || earningsData?.revenue || 0,
        count: earningsData?.count || 0,
        clicks: funnelData?.clicks || 0,
        signups: funnelData?.signups || 0,
        customers: funnelData?.customers || 0,
      };
    })
    .sort((a, b) => a.period.localeCompare(b.period));

  return mergedData;
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('tabootv_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiUrl = getRequiredEnv('NEXT_PUBLIC_API_URL');

    const userResponse = await fetch(`${apiUrl}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Failed to verify user' }, { status: 401 });
    }

    const userData = await userResponse.json();
    const userEmail = userData.user?.email || userData.email;

    // Get promoter ID from mapping or use default
    const promoterId = PROMOTER_ID_MAP[userEmail] || DEFAULT_PROMOTER_ID;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const groupBy = (searchParams.get('group_by') || 'day') as GroupBy;
    const startDate = searchParams.get('start_date') || getDefaultStartDate();
    const endDate = searchParams.get('end_date') || new Date().toISOString();

    // Validate group_by parameter
    if (!['day', 'week', 'month', 'year'].includes(groupBy)) {
      return NextResponse.json(
        { error: 'Invalid group_by parameter. Must be day, week, month, or year.' },
        { status: 400 }
      );
    }

    // Fetch comprehensive data from FirstPromoter API (V2 for everything)
    const { profile, series, filteredStats, recentCommissions, payoutHistory, v2Reports } =
      await getComprehensiveEarningsData({
        promoterId,
        startDate,
        endDate,
        groupBy,
      });

    if (!profile) {
      return NextResponse.json({ error: 'Promoter not found' }, { status: 404 });
    }

    // Calculate conversion rates
    const clickToSignup =
      profile.stats.clicks > 0 ? (profile.stats.signups / profile.stats.clicks) * 100 : 0;
    const signupToCustomer =
      profile.stats.signups > 0 ? (profile.stats.customers / profile.stats.signups) * 100 : 0;

    const response: EarningsResponse = {
      promoter: {
        id: profile.id,
        name: profile.name ?? '',
        email: profile.email ?? '',
        refId: profile.refId ?? '',
        referralLink: profile.referralLink ?? '',
        status: profile.status ?? 'active',
        payoutMethod: profile.payoutMethod ?? null,
        joinedAt: profile.joinedAt ?? new Date().toISOString(),
      },
      // Filtered stats based on date range (from V2 Reports API + rewards for earnings)
      summary: {
        clicks: filteredStats.clicks,
        signups: filteredStats.signups,
        customers: filteredStats.customers,
        sales: filteredStats.sales,
        revenue: filteredStats.revenue,
        earnings: filteredStats.earnings,
      },
      // All-time stats from profile
      allTimeStats: {
        clicks: profile.stats.clicks,
        signups: profile.stats.signups,
        customers: profile.stats.customers,
        sales: profile.stats.sales,
        revenue: profile.stats.revenue,
        earnings: profile.stats.earnings,
        activeCustomers: profile.stats.activeCustomers,
      },
      balance: {
        current: profile.balance.current,
        pending: profile.balance.pending,
        paid: profile.balance.paid,
      },
      conversionRates: {
        clickToSignup: Math.round(clickToSignup * 100) / 100,
        signupToCustomer: Math.round(signupToCustomer * 100) / 100,
      },
      series: mergeFunnelData(series, v2Reports),
      recentCommissions: recentCommissions.map((c: V2Commission) => ({
        id: c.id,
        status: c.status,
        saleAmount: c.sale_amount,
        commissionAmount: c.amount,
        planId: c.plan_id || 'unknown',
        referralEmail: c.referral?.email || 'Unknown',
        rewardName: c.reward?.name || 'Commission',
        createdAt: c.created_at,
      })),
      payoutHistory: payoutHistory.map((p: V2Payout) => ({
        id: p.id,
        status: p.status,
        amount: p.amount,
        periodStart: p.period_start,
        periodEnd: p.period_end,
        paidAt: p.paid_at || null,
        payoutMethod: p.payout_method?.method || 'Unknown',
      })),
      groupBy,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch (error) {
    log.error({ err: error }, 'Earnings API error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString();
}
