/**
 * Authentication Cookie Configuration
 *
 * Shared constants for HttpOnly cookie management.
 * Used by Next.js API routes and middleware.
 */

export const TOKEN_KEY = 'tabootv_token';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
};

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
  return process.env.NEXT_PUBLIC_API_URL || 'https://app.taboo.tv/api';
}
