import { decodeCookieToken } from '@/shared/lib/auth/cookie-config';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Cookie keys
const TOKEN_KEY = 'tabootv_token';

// Public routes that don't require authentication
// Note: Duplicate auth routes (/login, /signup, /sign-up) are handled by
// HTTP 301 redirects in next.config.ts before reaching middleware
const PUBLIC_ROUTES = [
  '/sign-in',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/choose-plan',
  '/auth/whop-callback',
  '/redeem',
];

// O(1) regex for skipping static files and internal routes
const SKIP_REGEX = /^\/(api|_next)\/.+|\.(png|jpe?g|gif|svg|ico|webp|css|js|woff2?|ttf|eot)$/;

// Auth pages for redirect logic (canonical routes only)
const AUTH_PAGES = ['/sign-in', '/register'];

/**
 * Check if middleware should skip processing this path
 */
function shouldSkipMiddleware(pathname: string): boolean {
  return SKIP_REGEX.test(pathname);
}

/**
 * Check if route is public (no auth required)
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route === '/') return pathname === '/';
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

/**
 * Check if route is an auth page (sign-in, sign-up, etc.)
 */
function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((page) => pathname.startsWith(page));
}

/**
 * Validate redirect parameter to prevent open redirects
 */
function getValidRedirect(redirectParam: string | null): string | null {
  if (!redirectParam) return null;

  // Only allow relative paths
  if (!redirectParam.startsWith('/')) return null;

  // Block absolute URLs
  if (redirectParam.includes('://')) return null;

  // Block protocol-relative URLs
  if (redirectParam.startsWith('//')) return null;

  // Don't redirect to auth pages
  if (isAuthPage(redirectParam)) return null;

  return redirectParam;
}

/**
 * Redirect to sign-in with optional redirect parameter
 */
function redirectToSignIn(request: NextRequest, originalPath: string): NextResponse {
  const signInUrl = new URL('/sign-in', request.url);

  // Validate and preserve destination for redirect after login
  const validRedirect = getValidRedirect(originalPath);
  if (validRedirect) {
    signInUrl.searchParams.set('redirect', validRedirect);
  }

  return NextResponse.redirect(signInUrl);
}

/**
 * Redirect to home
 */
function redirectToHome(request: NextRequest): NextResponse {
  const homeUrl = new URL('/', request.url);
  return NextResponse.redirect(homeUrl);
}

/**
 * Main proxy function — runs at the edge, no async needed
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] Processing:', pathname);
  }

  // 1. Skip middleware for static files and specific patterns
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  // 2. Get token from cookie (decode URL-encoded Sanctum tokens)
  const token = decodeCookieToken(request.cookies.get(TOKEN_KEY)?.value);

  // 3. Handle public routes
  if (isPublicRoute(pathname)) {
    // Allow access to public routes including auth pages.
    // Client-side useGuestOnly hook will redirect authenticated users
    // AFTER checkAuth() verifies the token. This prevents redirect loops
    // where middleware redirects based on cookie existence alone.
    // Redirect authenticated users away from auth pages
    if (token && isAuthPage(pathname)) {
      return redirectToHome(request);
    }

    return NextResponse.next();
  }

  // 4. Protected route - require authentication
  if (!token) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] No token found, redirecting to sign-in');
    }
    return redirectToSignIn(request, pathname);
  }

  // 5. Allow request to proceed (subscription check handled client-side by AccessGate)
  return NextResponse.next();
}

/**
 * Middleware configuration
 * Specify which routes middleware runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (they have their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
