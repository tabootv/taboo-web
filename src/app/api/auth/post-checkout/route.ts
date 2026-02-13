/**
 * Post-Checkout API Route
 *
 * After Whop payment completes, this route:
 * 1. Reads the checkout_intent cookie (signed JWT)
 * 2. Calls /auth/checkout-claim to register or claim the account
 * 3. Sets auth token and (conditionally) password hint cookies
 *
 * Uses /auth/checkout-claim instead of /register to handle the webhook race
 * condition where the Whop webhook may create the user before this route runs.
 * See docs/agents/subscriptions.md (Checkout Claim section) for the backend spec.
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { verifyCheckoutIntent, encryptPasswordHint } from '@/shared/lib/auth/checkout-intent';
import {
  COOKIE_OPTIONS,
  TOKEN_KEY,
  getApiUrl,
  setStateCookies,
} from '@/shared/lib/auth/cookie-config';
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

    // 3. Claim account on backend (handles webhook race condition)
    const apiUrl = getApiUrl();
    const claimResponse = await fetch(`${apiUrl}/auth/checkout-claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: intent.email,
        receipt_id,
        first_name: firstName,
        last_name: 'User',
        password: randomPassword,
      }),
    });

    const claimData = await claimResponse.json();

    // 4. Handle existing user (genuine account, not webhook-created)
    if (claimResponse.status === 409) {
      const res = NextResponse.json(
        { existing_user: true, email: claimData?.email || intent.email },
        { status: 409 }
      );
      res.cookies.delete(CHECKOUT_INTENT_COOKIE);
      return res;
    }

    if (!claimResponse.ok) {
      const message = claimData?.message || 'Registration failed';
      return NextResponse.json({ message }, { status: claimResponse.status });
    }

    // 5. Extract token from claim response
    let token: string | undefined;
    let user: Record<string, unknown> | undefined;
    let subscribed: boolean | undefined;
    let autoClaimed = false;

    if ('data' in claimData && claimData.data?.token) {
      token = claimData.data.token;
      user = claimData.data.user;
      subscribed = claimData.data.subscribed;
      autoClaimed = claimData.data.auto_claimed === true;
    } else if ('token' in claimData) {
      token = claimData.token;
      user = claimData.user;
      subscribed = claimData.subscribed;
      autoClaimed = claimData.auto_claimed === true;
    }

    if (!token) {
      log.error({ claimData }, 'Post-checkout: no token in claim response');
      return NextResponse.json(
        { message: 'Account created but login failed. Please sign in.' },
        { status: 500 }
      );
    }

    // 6. Build response and set cookies
    const logAction = autoClaimed ? 'claimed (webhook race)' : 'created';
    log.info(
      { email: intent.email, receiptId: receipt_id, autoClaimed },
      `Post-checkout account ${logAction}`
    );

    const res = NextResponse.json({
      message: autoClaimed ? 'Account claimed' : 'Account created',
      user,
      subscribed: subscribed ?? false,
      auto_claimed: autoClaimed,
    });

    // Set auth token cookie and state cookies
    res.cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
    setStateCookies(res, {
      profile_completed: !!(user as any)?.profile_completed,
      subscribed: !!subscribed,
      is_creator: !!(user as any)?.is_creator,
    });

    // Set encrypted password hint cookie only for new users (not auto-claimed)
    // Auto-claimed users skip the password step — they can set a password later
    // via Settings > Security or the Forgot Password flow.
    if (!autoClaimed) {
      const encryptedPw = encryptPasswordHint(randomPassword);
      res.cookies.set(PW_HINT_COOKIE, encryptedPw, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: PW_HINT_MAX_AGE,
      });
    }

    // Delete checkout intent cookie (single-use)
    res.cookies.delete(CHECKOUT_INTENT_COOKIE);

    return res;
  } catch (error) {
    log.error({ err: error }, 'Post-checkout error');
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
