import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRequiredEnv } from '@/shared/lib/config/env';

const FIRSTPROMOTER_API_KEY = getRequiredEnv('FIRSTPROMOTER_API_KEY');
const FIRSTPROMOTER_V2_ACCOUNT_ID = getRequiredEnv('FIRSTPROMOTER_V2_ACCOUNT_ID');

// Temporary mapping of user emails to FirstPromoter promoter IDs
// TODO: Replace with database lookup once Laravel backend is ready
const PROMOTER_ID_MAP: Record<string, number> = {
  'arab@taboo.tv': 10448915,
};

export interface PromoterStats {
  id: number;
  email: string;
  name: string;
  state: string;
  stats: {
    clicks_count: number;
    referrals_count: number;
    sales_count: number;
    customers_count: number;
    revenue_amount: number;
    active_customers_count: number;
  };
  balance: {
    current_balance: number;
    paid_balance: number;
  };
  profile: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  joined_at: string;
  last_login_at: string | null;
}

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tabootv_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      return NextResponse.json({
        error: 'No FirstPromoter account linked to this email',
        email: userEmail
      }, { status: 404 });
    }

    // Fetch promoter details from FirstPromoter V2 API
    const fpResponse = await fetch(`https://firstpromoter.com/api/v2/company/promoters/${promoterId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FIRSTPROMOTER_API_KEY}`,
        'Account-ID': FIRSTPROMOTER_V2_ACCOUNT_ID,
        'Accept': 'application/json',
      },
    });

    if (!fpResponse.ok) {
      const errorText = await fpResponse.text();
      console.error('FirstPromoter API error:', errorText);

      // Return mock data for development
      return NextResponse.json(getMockStats(promoterId, userEmail));
    }

    const fpData = await fpResponse.json();

    // Transform the response to our format
    const stats: PromoterStats = {
      id: fpData.id,
      email: fpData.email,
      name: fpData.name || `${fpData.profile?.first_name || ''} ${fpData.profile?.last_name || ''}`.trim(),
      state: fpData.state,
      stats: {
        clicks_count: fpData.stats?.clicks_count || 0,
        referrals_count: fpData.stats?.referrals_count || 0,
        sales_count: fpData.stats?.sales_count || 0,
        customers_count: fpData.stats?.customers_count || 0,
        revenue_amount: fpData.stats?.revenue_amount || 0,
        active_customers_count: fpData.stats?.active_customers_count || 0,
      },
      balance: {
        current_balance: fpData.current_balance || fpData.balance?.current_balance || 0,
        paid_balance: fpData.paid_balance || fpData.balance?.paid_balance || 0,
      },
      profile: {
        first_name: fpData.profile?.first_name || '',
        last_name: fpData.profile?.last_name || '',
        avatar_url: fpData.profile?.avatar_url || null,
      },
      joined_at: fpData.joined_at || fpData.created_at,
      last_login_at: fpData.last_login_at,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('FirstPromoter stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getMockStats(promoterId: number, email: string): PromoterStats {
  return {
    id: promoterId,
    email: email,
    name: email.split('@')[0] ?? email,
    state: 'approved',
    stats: {
      clicks_count: 1247,
      referrals_count: 89,
      sales_count: 34,
      customers_count: 28,
      revenue_amount: 285000, // $2,850.00 in cents
      active_customers_count: 22,
    },
    balance: {
      current_balance: 42500, // $425.00 in cents
      paid_balance: 157500, // $1,575.00 in cents
    },
    profile: {
      first_name: email.split('@')[0] ?? email,
      last_name: '',
      avatar_url: null,
    },
    joined_at: '2024-01-15T00:00:00Z',
    last_login_at: new Date().toISOString(),
  };
}
