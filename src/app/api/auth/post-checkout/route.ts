/**
 * Post-Checkout API Route
 *
 * After Whop payment completes, this route:
 * 1. Reads the checkout_intent cookie (signed JWT)
 * 2. Registers a new account with the email from the JWT
 * 3. Sets auth token and password hint cookies
 *
 * Pattern follows whop-exchange/route.ts for token extraction and cookie setting.
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { verifyCheckoutIntent, encryptPasswordHint } from '@/shared/lib/auth/checkout-intent';
import { COOKIE_OPTIONS, TOKEN_KEY, getApiUrl } from '@/shared/lib/auth/cookie-config';
import { createApiLogger } from '@/shared/lib/logger';

const log = createApiLogger('/api/auth/post-checkout', 'POST');

const CHECKOUT_INTENT_COOKIE = 'checkout_intent';
const PW_HINT_COOKIE = '_pw_hint';
const PW_HINT_MAX_AGE = 60 * 10; // 10 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { receipt_id } = body;

    if (!receipt_id || typeof receipt_id !== 'string') {
      return NextResponse.json({ message: 'Receipt ID is required' }, { status: 400 });
    }

    // 1. Read and verify checkout intent cookie
    const cookieStore = await cookies();
    const intentToken = cookieStore.get(CHECKOUT_INTENT_COOKIE)?.value;

    if (!intentToken) {
      return NextResponse.json(
        { message: 'Checkout session expired. Please try again.' },
        { status: 401 }
      );
    }

    let intent;
    try {
      intent = await verifyCheckoutIntent(intentToken);
    } catch {
      return NextResponse.json(
        { message: 'Invalid or expired checkout session. Please try again.' },
        { status: 401 }
      );
    }

    // 2. Generate random password for initial account
    const randomPassword = randomUUID();
    const emailPrefix = intent.email.split('@')[0] || 'New';
    const firstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

    // 3. Register account on backend
    const apiUrl = getApiUrl();
    const registerResponse = await fetch(`${apiUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: intent.email,
        first_name: firstName,
        last_name: 'User',
        password: randomPassword,
        password_confirmation: randomPassword,
      }),
    });

    const registerData = await registerResponse.json();

    // 4. Handle "email already taken" case
    if (!registerResponse.ok) {
      const message =
        registerData?.message || registerData?.errors?.email?.[0] || 'Registration failed';

      const isEmailTaken =
        registerResponse.status === 422 &&
        (message.toLowerCase().includes('already') || message.toLowerCase().includes('taken'));

      if (isEmailTaken) {
        // Delete the checkout intent cookie
        const res = NextResponse.json(
          { existing_user: true, email: intent.email },
          { status: 409 }
        );
        res.cookies.delete(CHECKOUT_INTENT_COOKIE);
        return res;
      }

      return NextResponse.json({ message }, { status: registerResponse.status });
    }

    // 5. Extract token from register response
    let token: string | undefined;
    let user: Record<string, unknown> | undefined;
    let subscribed: boolean | undefined;

    if ('data' in registerData && registerData.data?.token) {
      token = registerData.data.token;
      user = registerData.data.user;
      subscribed = registerData.data.subscribed;
    } else if ('token' in registerData) {
      token = registerData.token;
      user = registerData.user;
      subscribed = registerData.subscribed;
    }

    if (!token) {
      log.error({ registerData }, 'Post-checkout: no token in register response');
      return NextResponse.json(
        { message: 'Account created but login failed. Please sign in.' },
        { status: 500 }
      );
    }

    // 6. Build response and set cookies
    log.info({ email: intent.email, receiptId: receipt_id }, 'Post-checkout account created');

    const res = NextResponse.json({
      message: 'Account created',
      user,
      subscribed: subscribed ?? false,
    });

    // Set auth token cookie
    res.cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);

    // Set encrypted password hint cookie
    const encryptedPw = encryptPasswordHint(randomPassword);
    res.cookies.set(PW_HINT_COOKIE, encryptedPw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: PW_HINT_MAX_AGE,
    });

    // Delete checkout intent cookie (single-use)
    res.cookies.delete(CHECKOUT_INTENT_COOKIE);

    return res;
  } catch (error) {
    log.error({ err: error }, 'Post-checkout error');
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
