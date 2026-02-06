/**
 * Logout API Route (Auth Proxy)
 *
 * Proxies logout requests to backend and deletes the HttpOnly cookie.
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { TOKEN_KEY, decodeCookieToken, getApiUrl } from '@/shared/lib/auth/cookie-config';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  try {
    const token = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);
    const apiUrl = getApiUrl();

    // Call backend logout if token exists
    if (token) {
      const body = await request.json().catch(() => ({}));

      await fetch(`${apiUrl}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }).catch((err) => {
        console.error('Backend logout error:', err);
      });
    }

    // Delete the HttpOnly cookie on the response object
    const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
    res.cookies.delete(TOKEN_KEY);
    return res;
  } catch (error) {
    // Still delete cookie on error
    console.error('Logout proxy error:', error);
    const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
    res.cookies.delete(TOKEN_KEY);
    return res;
  }
}
