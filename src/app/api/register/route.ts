/**
 * Register API Route (Auth Proxy)
 *
 * Proxies registration requests to backend, extracts token from response,
 * and sets it as an HttpOnly cookie for XSS protection.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  COOKIE_OPTIONS,
  TOKEN_KEY,
  getApiUrl,
  setStateCookies,
} from '@/shared/lib/auth/cookie-config';
import { createApiLogger } from '@/shared/lib/logger';

const log = createApiLogger('/api/register', 'POST');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Extract token from response
    let token: string | undefined;
    let user: Record<string, unknown> | undefined;
    let subscribed: boolean | undefined;
    let message: string | undefined;

    if ('data' in data && data.data?.token) {
      token = data.data.token;
      user = data.data.user;
      subscribed = data.data.subscribed;
      message = data.message;
    } else if ('token' in data) {
      token = data.token;
      user = data.user;
      subscribed = data.subscribed;
      message = data.message;
    }

    const res = NextResponse.json({
      message: message || 'Success',
      user,
      subscribed,
    });

    if (token) {
      res.cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
      setStateCookies(res, {
        profile_completed: !!(user as any)?.profile_completed,
        subscribed: !!subscribed,
        is_creator: !!(user as any)?.is_creator,
      });
    }

    return res;
  } catch (error) {
    log.error({ err: error }, 'Register proxy error');
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
