import { getComprehensiveEarningsData, type GroupBy, type V2Commission, type V2Payout } from '@/lib/firstpromoter/client';
import { getRequiredEnv } from '@/shared/lib/config/env';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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

    // Handle ISO format with time (2025-12-23T00:00:00.000Z)
    if (/^\d{4}-\d{2}-\d{2}T/.test(dateStr)) {
      return dateStr.split('T')[0] ?? null;
    }

    // Handle "Week X, YYYY" format - convert to start of that week (Sunday)
    const weekMatch = dateStr.match(/^Week\s+(\d+),?\s*(\d{4})$/i);
    if (weekMatch) {
      const [, weekNum, year] = weekMatch;
      // Calculate the start date of the week (Sunday to match groupRewardsByPeriod)
      const jan1 = new Date(parseInt(year!, 10), 0, 1);
      const daysToAdd = (parseInt(weekNum!, 10) - 1) * 7;
      const weekStart = new Date(jan1.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
      // Adjust to Sunday (getDay() returns 0 for Sunday)
      const dayOfWeek = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - dayOfWeek);
      return weekStart.toISOString().split('T')[0] ?? null;
    }

    // Handle "Month YYYY" or "YYYY-MM" format
    const monthYearMatch = dateStr.match(/^(\w+)\s+(\d{4})$/);
    if (monthYearMatch) {
      const [, month, year] = monthYearMatch;
      const date = new Date(`${month} 1, ${year}`);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0] ?? null;
      }
    }

    // Handle "YYYY-MM" format
    const yearMonthMatch = dateStr.match(/^(\d{4})-(\d{2})$/);
    if (yearMonthMatch) {
      return `${yearMonthMatch[1]}-${yearMonthMatch[2]}-01`;
    }

    // Handle "YYYY" format (for yearly grouping)
    const yearOnlyMatch = dateStr.match(/^(\d{4})$/);
    if (yearOnlyMatch) {
      return `${yearOnlyMatch[1]}-01-01`;
    }

    // Handle "Mon DD, YYYY" format (e.g., "Jan 15, 2025")
    const monthDayYearMatch = dateStr.match(/^(\w{3})\s+(\d{1,2}),?\s*(\d{4})$/);
    if (monthDayYearMatch) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0] ?? null;
      }
    }

    // Try to parse the date normally
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
 * Group commissions by period to derive customers per day/week/month
 */
function groupCommissionsByPeriod(
  commissions: V2Commission[],
  groupBy: GroupBy
): Map<string, number> {
  const customersByPeriod = new Map<string, Set<number>>();

  for (const commission of commissions) {
    if (!commission.created_at || !commission.referral?.id) continue;

    const date = new Date(commission.created_at);
    let key: string;

    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0] ?? '';
        break;
      case 'week': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0] ?? '';
        break;
      }
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
        break;
      case 'year':
        key = `${date.getFullYear()}-01-01`;
        break;
      default:
        key = date.toISOString().split('T')[0] ?? '';
    }

    if (!customersByPeriod.has(key)) {
      customersByPeriod.set(key, new Set());
    }
    customersByPeriod.get(key)!.add(commission.referral.id);
  }

  // Convert Sets to counts
  const result = new Map<string, number>();
  customersByPeriod.forEach((referralSet, period) => {
    result.set(period, referralSet.size);
  });

  return result;
}

/**
 * Merge earnings data from rewards with funnel metrics from V2 Reports API
 * Falls back to deriving customers from commissions when V2 sub_data is empty
 */
function mergeFunnelData(
  earningsSeries: RewardDataPoint[],
  v2Reports: V2ReportResponse | null,
  commissions: V2Commission[],
  groupBy: GroupBy
): EarningsResponse['series'] {
  // Create a map of V2 funnel data by normalized date
  const funnelMap = new Map<string, { clicks: number; signups: number; customers: number; revenue: number }>();

  // Check if V2 sub_data has meaningful customer data
  let hasCustomerDataInSubData = false;
  if (v2Reports?.sub_data) {
    for (const item of v2Reports.sub_data) {
      const normalizedDate = safeParseDateToString(item.period);

      if (normalizedDate) {
        funnelMap.set(normalizedDate, {
          clicks: item.data.clicks_count || 0,
          signups: item.data.referrals_count || 0,
          customers: item.data.customers_count || 0,
          revenue: item.data.revenue_amount || 0,
        });

        if (item.data.customers_count > 0) {
          hasCustomerDataInSubData = true;
        }
      }
    }
  }

  // If V2 sub_data doesn't have customer data, derive from commissions
  let commissionsCustomerMap: Map<string, number> | null = null;
  if (!hasCustomerDataInSubData && commissions.length > 0) {
    commissionsCustomerMap = groupCommissionsByPeriod(commissions, groupBy);
  }

  // Create a map of earnings data by date for faster lookup
  const earningsMap = new Map<string, RewardDataPoint>();
  earningsSeries.forEach((item) => earningsMap.set(item.date, item));

  // Get all unique dates from all sources
  const allDates = new Set<string>();
  earningsSeries.forEach((item) => allDates.add(item.date));
  funnelMap.forEach((_, date) => allDates.add(date));
  // Also add dates from commissions-derived customers
  if (commissionsCustomerMap) {
    commissionsCustomerMap.forEach((_, date) => allDates.add(date));
  }

  // If we have no dates from any source, return empty array
  if (allDates.size === 0) {
    return [];
  }

  // Merge data for each date
  const mergedData = Array.from(allDates)
    .map((date) => {
      const earningsData = earningsMap.get(date);
      const funnelData = funnelMap.get(date);
      // Use commission-derived customers as fallback when funnelData has no customers
      const commissionsCustomers = commissionsCustomerMap?.get(date) || 0;
      const customers = funnelData?.customers || commissionsCustomers;

      return {
        period: date,
        earnings: earningsData?.earnings || 0,
        revenue: funnelData?.revenue || earningsData?.revenue || 0,
        count: earningsData?.count || 0,
        clicks: funnelData?.clicks || 0,
        signups: funnelData?.signups || 0,
        customers,
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
      }
    );

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
    const { profile, series, filteredStats, recentCommissions, allCommissions, payoutHistory, v2Reports } = await getComprehensiveEarningsData({
      promoterId,
      startDate,
      endDate,
      groupBy,
    });

    if (!profile) {
      return NextResponse.json({ error: 'Promoter not found' }, { status: 404 });
    }

    // Calculate conversion rates
    const clickToSignup = profile.stats.clicks > 0
      ? (profile.stats.signups / profile.stats.clicks) * 100
      : 0;
    const signupToCustomer = profile.stats.signups > 0
      ? (profile.stats.customers / profile.stats.signups) * 100
      : 0;

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
      series: mergeFunnelData(series, v2Reports, allCommissions, groupBy),
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
    console.error('Earnings API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString();
}
