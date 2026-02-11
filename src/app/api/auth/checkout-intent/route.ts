/**
 * Checkout Intent API Route
 *
 * Creates a signed JWT cookie tying the email to the checkout session.
 * Called before opening the Whop checkout modal for guest users.
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { signCheckoutIntent } from '@/shared/lib/auth/checkout-intent';

const CHECKOUT_INTENT_COOKIE = 'checkout_intent';
const COOKIE_MAX_AGE = 60 * 10; // 10 minutes

// Simple in-memory rate limiting: 5 requests per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 10 * 1000; // 10 minutes in ms

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Periodic cleanup (every 100 checks)
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap) {
      if (val.resetAt < now) rateLimitMap.delete(key);
    }
  }

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, plan_id } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ message: 'Valid email is required' }, { status: 400 });
    }

    if (!plan_id || typeof plan_id !== 'string') {
      return NextResponse.json({ message: 'Plan ID is required' }, { status: 400 });
    }

    const token = await signCheckoutIntent(email.toLowerCase().trim(), plan_id);

    const cookieStore = await cookies();
    cookieStore.set(CHECKOUT_INTENT_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Checkout intent error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
