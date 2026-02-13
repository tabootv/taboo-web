/**
 * Whop Exchange API Route (Auth Proxy)
 *
 * Proxies Whop OAuth code exchange requests to backend, extracts token from response,
 * and sets it as an HttpOnly cookie for XSS protection.
 *
 * Follows the same pattern as firebase-login/route.ts.
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  COOKIE_OPTIONS,
  TOKEN_KEY,
  SUBSCRIBED_KEY,
  decodeCookieToken,
  getApiUrl,
  getSubscribedCookieOptions,
} from '@/shared/lib/auth/cookie-config';
import { createApiLogger } from '@/shared/lib/logger';

const log = createApiLogger('/api/auth/whop-exchange', 'POST');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl = getApiUrl();

    // Read existing token for scenario 2 (already logged-in user)
    const cookieStore = await cookies();
    const existingToken = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (existingToken) {
      headers.Authorization = `Bearer ${existingToken}`;
    }

    const response = await fetch(`${apiUrl}/auth/whop-exchange`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // For 202 (existing user, needs login) - pass through without setting cookie
    if (response.status === 202) {
      return NextResponse.json(data, { status: 202 });
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Extract token from response
    let token: string | undefined;
    let user: Record<string, unknown> | undefined;
    let subscribed: boolean | undefined;
    let scenario: string | undefined;
    let requires_profile_completion: boolean | undefined;
    let message: string | undefined;

    if ('data' in data && data.data?.token) {
      token = data.data.token;
      user = data.data.user;
      subscribed = data.data.subscribed;
      scenario = data.data.scenario;
      requires_profile_completion = data.data.requires_profile_completion;
      message = data.message;
    } else if ('token' in data) {
      token = data.token;
      user = data.user;
      subscribed = data.subscribed;
      scenario = data.scenario;
      requires_profile_completion = data.requires_profile_completion;
      message = data.message;
    }

    // Build response without token
    const res = NextResponse.json({
      message: message || 'Success',
      user,
      subscribed,
      scenario,
      requires_profile_completion,
    });

    // Set HttpOnly cookie if token received
    if (token) {
      res.cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
      res.cookies.set(SUBSCRIBED_KEY, subscribed ? '1' : '0', getSubscribedCookieOptions());
    }

    return res;
  } catch (error) {
    log.error({ err: error }, 'Whop exchange proxy error');
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
