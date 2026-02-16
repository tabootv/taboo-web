import {
  decodeCookieToken,
  PROFILE_COMPLETED_KEY,
  SUBSCRIBED_KEY,
  IS_CREATOR_KEY,
} from '@/shared/lib/auth/cookie-config';
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
const SKIP_REGEX =
  /^\/(api|_next)\/.+|\.(png|jpe?g|gif|svg|ico|webp|webmanifest|css|js|woff2?|ttf|eot)$/;

// Auth pages for redirect logic (canonical routes only)
const AUTH_PAGES = ['/sign-in', '/register', '/redeem'];

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
    console.log(`[Proxy] No token, redirecting to sign-in`, { path: pathname });
    return redirectToSignIn(request, pathname);
  }

  // 5. State cookie gates (only trigger on explicit '0', missing cookies fall through)
  const profileCompleted = request.cookies.get(PROFILE_COMPLETED_KEY)?.value;
  const subscribed = request.cookies.get(SUBSCRIBED_KEY)?.value;
  const isCreator = request.cookies.get(IS_CREATOR_KEY)?.value;

  // 5a. Profile gate: incomplete profile → force /account/complete
  if (profileCompleted === '0') {
    if (pathname !== '/account/complete') {
      console.log(`[Proxy] Profile incomplete, redirecting to /account/complete`, {
        path: pathname,
      });
      return NextResponse.redirect(new URL('/account/complete', request.url));
    }
    return NextResponse.next();
  }

  // 5b. Subscription gate: not subscribed → limited access
  if (subscribed === '0') {
    if (
      isPublicRoute(pathname) ||
      pathname.startsWith('/account') ||
      pathname === '/profile' ||
      pathname.startsWith('/profile/')
    ) {
      return NextResponse.next();
    }
    console.log(`[Proxy] Not subscribed, redirecting to /choose-plan`, { path: pathname });
    return NextResponse.redirect(new URL('/choose-plan', request.url));
  }

  // 5c. Creator gate: non-creators cannot access /studio
  if (isCreator === '0' && pathname.startsWith('/studio')) {
    console.log(`[Proxy] Non-creator accessing /studio, redirecting to home`, { path: pathname });
    return redirectToHome(request);
  }

  // 6. Allow request to proceed
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
