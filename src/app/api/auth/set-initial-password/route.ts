/**
 * Set Initial Password API Route
 *
 * Uses the encrypted random password from the _pw_hint cookie
 * as current_password to set the user's chosen password.
 *
 * Called during the onboarding password step after payment-first registration.
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { decryptPasswordHint } from '@/shared/lib/auth/checkout-intent';
import { TOKEN_KEY, decodeCookieToken, getApiUrl } from '@/shared/lib/auth/cookie-config';
import { createApiLogger } from '@/shared/lib/logger';

const log = createApiLogger('/api/auth/set-initial-password', 'POST');

const PW_HINT_COOKIE = '_pw_hint';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, password_confirmation } = body;

    if (!password || !password_confirmation) {
      return NextResponse.json(
        { message: 'Password and confirmation are required' },
        { status: 400 }
      );
    }

    if (password !== password_confirmation) {
      return NextResponse.json({ message: 'Passwords do not match' }, { status: 400 });
    }

    // 1. Read auth token
    const cookieStore = await cookies();
    const authToken = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);

    if (!authToken) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // 2. Read and decrypt password hint
    const pwHint = cookieStore.get(PW_HINT_COOKIE)?.value;

    if (!pwHint) {
      return NextResponse.json(
        {
          message:
            'Password setup session expired. You can set a password from Settings > Security, or use Forgot Password.',
        },
        { status: 410 }
      );
    }

    let currentPassword: string;
    try {
      currentPassword = decryptPasswordHint(pwHint);
    } catch {
      return NextResponse.json(
        { message: 'Password setup session invalid. Please use Forgot Password.' },
        { status: 410 }
      );
    }

    // 3. Call backend to update password
    const apiUrl = getApiUrl();
    const updateResponse = await fetch(`${apiUrl}/profile/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        password,
        password_confirmation,
      }),
    });

    const updateData = await updateResponse.json();

    if (!updateResponse.ok) {
      return NextResponse.json(
        { message: updateData?.message || 'Failed to set password' },
        { status: updateResponse.status }
      );
    }

    // 4. Delete password hint cookie
    const res = NextResponse.json({
      message: updateData?.message || 'Password set successfully',
    });
    res.cookies.delete(PW_HINT_COOKIE);

    return res;
  } catch (error) {
    log.error({ err: error }, 'Set initial password error');
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
