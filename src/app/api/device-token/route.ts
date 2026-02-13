/**
 * Device Token API Route (Auth Proxy)
 *
 * Proxies FCM device token registration to backend,
 * attaching the auth token from HttpOnly cookie.
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { TOKEN_KEY, decodeCookieToken, getApiUrl } from '@/shared/lib/auth/cookie-config';
import { createApiLogger } from '@/shared/lib/logger';

const log = createApiLogger('/api/device-token', 'POST');

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);

    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/device-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    log.error({ err: error }, 'Device token proxy error');
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
