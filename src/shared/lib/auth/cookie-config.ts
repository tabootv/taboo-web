/**
 * Authentication Cookie Configuration
 *
 * Shared constants for HttpOnly cookie management.
 * Used by Next.js API routes and middleware.
 */

import type { NextResponse } from 'next/server';

export const TOKEN_KEY = 'tabootv_token';

export const PROFILE_COMPLETED_KEY = 'tabootv_profile_completed';
export const SUBSCRIBED_KEY = 'tabootv_subscribed';
export const IS_CREATOR_KEY = 'tabootv_is_creator';

export const STATE_COOKIE_KEYS = [PROFILE_COMPLETED_KEY, SUBSCRIBED_KEY, IS_CREATOR_KEY] as const;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
};

/**
 * Get cookie options based on remember me preference.
 * - true:      30-day maxAge
 * - false:     session cookie (no maxAge, dies on browser close)
 * - undefined: 7-day default (backward compatible)
 */
export function getCookieOptions(rememberMe?: boolean) {
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  if (rememberMe === true) {
    return { ...base, maxAge: 60 * 60 * 24 * 30 }; // 30 days
  }
  if (rememberMe === false) {
    return base; // session cookie
  }
  return { ...base, maxAge: 60 * 60 * 24 * 7 }; // 7 days default
}

/**
 * Set all three state cookies on a NextResponse.
 * Values are stored as '1' (true) or '0' (false).
 */
export function setStateCookies(
  res: NextResponse,
  state: { profile_completed: boolean; subscribed: boolean; is_creator: boolean },
  maxAge?: number | null
) {
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  // null = session cookie (no maxAge), undefined = use 7-day default
  const opts = maxAge === null ? base : { ...base, maxAge: maxAge ?? COOKIE_OPTIONS.maxAge };

  res.cookies.set(PROFILE_COMPLETED_KEY, state.profile_completed ? '1' : '0', opts);
  res.cookies.set(SUBSCRIBED_KEY, state.subscribed ? '1' : '0', opts);
  res.cookies.set(IS_CREATOR_KEY, state.is_creator ? '1' : '0', opts);
}

/**
 * Delete all three state cookies from a NextResponse.
 */
export function deleteStateCookies(res: NextResponse) {
  for (const key of STATE_COOKIE_KEYS) {
    res.cookies.delete(key);
  }
}

/**
 * Safely decode a cookie token value.
 *
 * Next.js ResponseCookies URL-encodes cookie values when setting them.
 * Sanctum tokens contain `|` which gets encoded as `%7C`.
 * This function decodes the value so the backend receives the original token.
 */
export function decodeCookieToken(rawValue: string | undefined): string | undefined {
  if (!rawValue) return undefined;
  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
}

/**
 * Get the backend API URL
 */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.taboo.tv/api';
}
