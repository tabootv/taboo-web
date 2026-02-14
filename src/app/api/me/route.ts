/**
 * Me API Route (Auth Proxy)
 *
 * Proxies /me requests to backend, attaching the token from HttpOnly cookie.
 * Returns authentication status alongside user data.
 */

import {
  TOKEN_KEY,
  decodeCookieToken,
  getApiUrl,
  setStateCookies,
} from '@/shared/lib/auth/cookie-config';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createApiLogger } from '@/shared/lib/logger';
import { getProxyHeaders } from '@/shared/lib/proxy-headers';

const log = createApiLogger('/api/me', 'GET');

export async function GET(request: NextRequest) {
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
        ...getProxyHeaders(request),
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

    const res = NextResponse.json({
      authenticated: true,
      message: message || 'Success',
      user,
      subscribed,
    });

    // Refresh state cookies on every /api/me call to keep them fresh
    if (user) {
      setStateCookies(res, {
        profile_completed: !!(user as any)?.profile_completed,
        subscribed: !!subscribed,
        is_creator: !!(user as any)?.is_creator,
      });
    }

    return res;
  } catch (error) {
    log.error({ err: error }, 'Me proxy error');
    return NextResponse.json(
      { authenticated: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
