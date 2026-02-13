/**
 * Authentication Cookie Configuration
 *
 * Shared constants for HttpOnly cookie management.
 * Used by Next.js API routes and middleware.
 */

export const TOKEN_KEY = 'tabootv_token';
export const SUBSCRIBED_KEY = 'tabootv_subscribed';

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
 * Cookie options for the subscription status cookie.
 * Non-HttpOnly so the proxy can read it, same path/sameSite/secure settings.
 */
export function getSubscribedCookieOptions() {
  return {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}

/**
 * Get the backend API URL
 */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'https://app.taboo.tv/api';
}
