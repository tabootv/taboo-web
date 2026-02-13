/**
 * Me API Route (Auth Proxy)
 *
 * Proxies /me requests to backend, attaching the token from HttpOnly cookie.
 * Returns authentication status alongside user data.
 */

import { TOKEN_KEY, decodeCookieToken, getApiUrl } from '@/shared/lib/auth/cookie-config';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createApiLogger } from '@/shared/lib/logger';

const log = createApiLogger('/api/me', 'GET');

export async function GET() {
  const cookieStore = await cookies();

  try {
    const token = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);

    if (!token) {
      return NextResponse.json(
        { authenticated: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const res = NextResponse.json(
        { authenticated: false, message: 'Not authenticated' },
        { status: 401 }
      );
      if (response.status === 401) {
        res.cookies.delete(TOKEN_KEY);
      }
      return res;
    }

    const data = await response.json();

    // Handle both wrapped and flat responses
    let user: Record<string, unknown> | undefined;
    let subscribed: boolean | undefined;
    let message: string | undefined;

    if ('data' in data && data.data?.user) {
      user = data.data.user;
      subscribed = data.data.subscribed;
      message = data.message;
    } else if ('user' in data) {
      user = data.user;
      subscribed = data.subscribed;
      message = data.message;
    }

    return NextResponse.json({
      authenticated: true,
      message: message || 'Success',
      user,
      subscribed,
    });
  } catch (error) {
    log.error({ err: error }, 'Me proxy error');
    return NextResponse.json(
      { authenticated: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
