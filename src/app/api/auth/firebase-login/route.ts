/**
 * Firebase Login API Route (Auth Proxy)
 *
 * Proxies Firebase/social auth requests to backend, extracts token from response,
 * and sets it as an HttpOnly cookie for XSS protection.
 */

import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_OPTIONS, TOKEN_KEY, getApiUrl } from '@/shared/lib/auth/cookie-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/auth/firebase-login`, {
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
    let requires_username: boolean | undefined;
    let message: string | undefined;

    if ('data' in data && data.data?.token) {
      token = data.data.token;
      user = data.data.user;
      subscribed = data.data.subscribed;
      requires_username = data.data.requires_username;
      message = data.message;
    } else if ('token' in data) {
      token = data.token;
      user = data.user;
      subscribed = data.subscribed;
      requires_username = data.requires_username;
      message = data.message;
    }

    const res = NextResponse.json({
      message: message || 'Success',
      user,
      subscribed,
      requires_username,
    });

    if (token) {
      res.cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
    }

    return res;
  } catch (error) {
    console.error('Firebase login proxy error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
