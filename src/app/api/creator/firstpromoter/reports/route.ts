import { getRequiredEnv } from '@/shared/lib/config/env';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const FIRSTPROMOTER_API_KEY = getRequiredEnv('FIRSTPROMOTER_API_KEY');
const FIRSTPROMOTER_V2_ACCOUNT_ID = getRequiredEnv('FIRSTPROMOTER_V2_ACCOUNT_ID');

// Temporary mapping of user emails to FirstPromoter promoter IDs
const PROMOTER_ID_MAP: Record<string, number> = {
  'arab@taboo.tv': 10448915,
};

export interface ReportDataPoint {
  date: string;
  clicks_count: number;
  referrals_count: number;
  sales_count: number;
  customers_count: number;
  revenue_amount: number;
  promoter_earnings_amount: number;
}

export interface PromoterReportResponse {
  promoter_id: number;
  period: {
    start_date: string;
    end_date: string;
    group_by: string;
  };
  totals: {
    clicks_count: number;
    referrals_count: number;
    sales_count: number;
    customers_count: number;
    revenue_amount: number;
    promoter_earnings_amount: number;
  };
  data: ReportDataPoint[];
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tabootv_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const groupBy = searchParams.get('group_by') || 'day';
    const startDate = searchParams.get('start_date') || getDefaultStartDate();
    const endDate = searchParams.get('end_date') || new Date().toISOString();

    const { getRequiredEnv } = await import('@/shared/lib/config/env');
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

    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const promoterId = PROMOTER_ID_MAP[userEmail];

    if (!promoterId) {
      return NextResponse.json(
        {
          error: 'No FirstPromoter account linked to this email',
          email: userEmail,
        },
        { status: 404 }
      );
    }

    // Build the query params for FirstPromoter API
    const columns = [
      'clicks_count',
      'referrals_count',
      'sales_count',
      'customers_count',
      'revenue_amount',
      'promoter_earnings_amount',
    ];

    // For array params, we need to add them individually
    const url = new URL('https://firstpromoter.com/api/v2/company/reports/promoters');
    columns.forEach((col) => url.searchParams.append('columns[]', col));
    url.searchParams.append('group_by', groupBy);
    url.searchParams.append('start_date', startDate);
    url.searchParams.append('end_date', endDate);
    url.searchParams.append('q', `id:${promoterId}`);

    const fpResponse = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${FIRSTPROMOTER_API_KEY}`,
        'Account-ID': FIRSTPROMOTER_V2_ACCOUNT_ID,
        Accept: 'application/json',
      },
    });

    if (!fpResponse.ok) {
      const errorText = await fpResponse.text();
      console.error('FirstPromoter Reports API error:', errorText);

      // Return mock data for development
      return NextResponse.json(getMockReportData(promoterId, startDate, endDate, groupBy));
    }

    const fpData = await fpResponse.json();

    // Transform the response
    const promoterData = fpData.data?.find((p: { id: number }) => p.id === promoterId);

    if (!promoterData) {
      // Return empty data structure
      return NextResponse.json({
        promoter_id: promoterId,
        period: { start_date: startDate, end_date: endDate, group_by: groupBy },
        totals: {
          clicks_count: 0,
          referrals_count: 0,
          sales_count: 0,
          customers_count: 0,
          revenue_amount: 0,
          promoter_earnings_amount: 0,
        },
        data: [],
      });
    }

    const response: PromoterReportResponse = {
      promoter_id: promoterId,
      period: {
        start_date: startDate,
        end_date: endDate,
        group_by: groupBy,
      },
      totals: {
        clicks_count: promoterData.aggregated_data?.clicks_count || 0,
        referrals_count: promoterData.aggregated_data?.referrals_count || 0,
        sales_count: promoterData.aggregated_data?.sales_count || 0,
        customers_count: promoterData.aggregated_data?.customers_count || 0,
        revenue_amount: promoterData.aggregated_data?.revenue_amount || 0,
        promoter_earnings_amount: promoterData.aggregated_data?.promoter_earnings_amount || 0,
      },
      data: (promoterData.sub_data || []).map((item: Record<string, number | string>) => ({
        date: item.date || item.period,
        clicks_count: item.clicks_count || 0,
        referrals_count: item.referrals_count || 0,
        sales_count: item.sales_count || 0,
        customers_count: item.customers_count || 0,
        revenue_amount: item.revenue_amount || 0,
        promoter_earnings_amount: item.promoter_earnings_amount || 0,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('FirstPromoter reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString();
}

function getMockReportData(
  promoterId: number,
  startDate: string,
  endDate: string,
  groupBy: string
): PromoterReportResponse {
  const data: ReportDataPoint[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let current = new Date(start);
  while (current <= end) {
    data.push({
      date: current.toISOString().split('T')[0] ?? '',
      clicks_count: Math.floor(Math.random() * 50) + 10,
      referrals_count: Math.floor(Math.random() * 10),
      sales_count: Math.floor(Math.random() * 5),
      customers_count: Math.floor(Math.random() * 3),
      revenue_amount: Math.floor(Math.random() * 500),
      promoter_earnings_amount: Math.floor(Math.random() * 100),
    });

    if (groupBy === 'day') {
      current.setDate(current.getDate() + 1);
    } else if (groupBy === 'week') {
      current.setDate(current.getDate() + 7);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
  }

  const totals = data.reduce(
    (acc, item) => ({
      clicks_count: acc.clicks_count + item.clicks_count,
      referrals_count: acc.referrals_count + item.referrals_count,
      sales_count: acc.sales_count + item.sales_count,
      customers_count: acc.customers_count + item.customers_count,
      revenue_amount: acc.revenue_amount + item.revenue_amount,
      promoter_earnings_amount: acc.promoter_earnings_amount + item.promoter_earnings_amount,
    }),
    {
      clicks_count: 0,
      referrals_count: 0,
      sales_count: 0,
      customers_count: 0,
      revenue_amount: 0,
      promoter_earnings_amount: 0,
    }
  );

  return {
    promoter_id: promoterId,
    period: { start_date: startDate, end_date: endDate, group_by: groupBy },
    totals,
    data,
  };
}
