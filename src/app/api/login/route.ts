/**
 * Login API Route (Auth Proxy)
 *
 * Proxies login requests to backend, extracts token from response,
 * and sets it as an HttpOnly cookie for XSS protection.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getCookieOptions,
  TOKEN_KEY,
  getApiUrl,
  setStateCookies,
} from '@/shared/lib/auth/cookie-config';
import { createApiLogger } from '@/shared/lib/logger';
import { getProxyHeaders } from '@/shared/lib/proxy-headers';

const log = createApiLogger('/api/login', 'POST');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl = getApiUrl();

    // Extract remember_me before forwarding to backend
    const { remember_me, ...loginData } = body;

    const response = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...getProxyHeaders(request),
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Extract token from response (handle both wrapped and flat responses)
    let token: string | undefined;
    let user: Record<string, unknown> | undefined;
    let subscribed: boolean | undefined;
    let message: string | undefined;

    if ('data' in data && data.data?.token) {
      // Wrapped: { success, message, data: { user, token, subscribed } }
      token = data.data.token;
      user = data.data.user;
      subscribed = data.data.subscribed;
      message = data.message;
    } else if ('token' in data) {
      // Flat: { message, user, token, subscribed }
      token = data.token;
      user = data.user;
      subscribed = data.subscribed;
      message = data.message;
    }

    // Return response without token, set HttpOnly cookie on the response object
    const res = NextResponse.json({
      message: message || 'Success',
      user,
      subscribed,
    });

    if (token) {
      const cookieOpts = getCookieOptions(remember_me);
      res.cookies.set(TOKEN_KEY, token, cookieOpts);
      setStateCookies(
        res,
        {
          profile_completed: !!(user as any)?.profile_completed,
          subscribed: !!subscribed,
          is_creator: !!(user as any)?.is_creator,
        },
        'maxAge' in cookieOpts ? cookieOpts.maxAge : null
      );
    }

    return res;
  } catch (error) {
    log.error({ err: error }, 'Login proxy error');
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
