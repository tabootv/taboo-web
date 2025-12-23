import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const FIRSTPROMOTER_API_KEY = process.env.FIRSTPROMOTER_API_KEY || 'hPq6CerLNVYlScmHTeplSbnze5IzlZ1x6aHUZ2WmvmY';

// Mapping of user emails to FirstPromoter promoter IDs
// TODO: Replace with database lookup once Laravel backend is ready
const PROMOTER_ID_MAP: Record<string, number> = {
  'arab@taboo.tv': 10448915,
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tabootv_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user info from Laravel backend
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://app.taboo.tv/api'}/me`, {
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

    // Call FirstPromoter V1 API to get iframe access token
    const fpResponse = await fetch(
      `https://firstpromoter.com/api/v1/promoters/iframe_login?promoter_id=${promoterId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FIRSTPROMOTER_API_KEY}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!fpResponse.ok) {
      const errorText = await fpResponse.text();
      console.error('FirstPromoter iframe_login error:', fpResponse.status, errorText);
      return NextResponse.json({
        error: 'Failed to get iframe token',
        details: errorText
      }, { status: 500 });
    }

    const fpData = await fpResponse.json();

    return NextResponse.json({
      access_token: fpData.access_token,
      expires_in: fpData.expires_in,
    });
  } catch (error) {
    console.error('FirstPromoter iframe token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
