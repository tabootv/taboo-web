import { decodeCookieToken } from '@/shared/lib/auth/cookie-config';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Token key in cookies
const TOKEN_KEY = 'tabootv_token';

// Public routes that don't require authentication
// Note: Duplicate auth routes (/login, /signup, /sign-up) are handled by
// HTTP 301 redirects in next.config.ts before reaching middleware
const PUBLIC_ROUTES = [
  '/sign-in',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/confirm-password',
  '/plans',
  '/choose-plan',
  '/checkout',
  '/profile/complete',
  '/auth/whop-callback',
  '/',
];

// Patterns to skip middleware processing
const SKIP_PATTERNS = [
  '/_next/',
  '/api/',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.webp',
  '.css',
  '.js',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
];

// Auth pages for redirect logic (canonical routes only)
const AUTH_PAGES = ['/sign-in', '/register'];

// Interface for /me API response
interface MeResponse {
  user: {
    id: number;
    email: string;
    is_creator: boolean;
    channel?: {
      id: number;
      name: string;
    };
  };
}

/**
 * Check if middleware should skip processing this path
 */
function shouldSkipMiddleware(pathname: string): boolean {
  return SKIP_PATTERNS.some((pattern) => pathname.includes(pattern));
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
 * Check if route requires creator status
 */
function isCreatorRoute(pathname: string): boolean {
  return pathname.startsWith('/studio');
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
  const homeUrl = new URL('/home', request.url);
  return NextResponse.redirect(homeUrl);
}

/**
 * Validate creator status by calling /me endpoint
 * Returns true if user is a creator (has is_creator flag or channel object)
 */
async function validateCreatorStatus(token: string): Promise<boolean> {
  // Skip validation in E2E test mode - test auth is handled by test fixtures
  // if (process.env.PLAYWRIGHT_MOCK_MODE === 'true') {
  //   if (process.env.NODE_ENV === 'development') {
  //     console.log('[Middleware] E2E test mode - skipping creator validation');
  //   }
  //   return true;
  // }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://app.taboo.tv/api';

    const response = await fetch(`${apiUrl}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      // Cache for 60 seconds to reduce API calls
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] Creator validation failed: API returned', response.status);
      }
      return false;
    }

    const data = (await response.json()) as MeResponse;
    const user = data.user || data;

    // User is creator if they have is_creator flag or a channel
    const isCreator = !!(user.is_creator || user.channel);

    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Creator validation:', {
        isCreator,
        has_is_creator: user.is_creator,
        has_channel: !!user.channel,
      });
    }

    return isCreator;
  } catch (error) {
    // Fail closed - deny access on error
    if (process.env.NODE_ENV === 'development') {
      console.error('[Middleware] Creator validation error:', error);
    }
    return false;
  }
}

/**
 * Main middleware function
 */
export async function proxy(request: NextRequest) {
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

  // 5. Creator-only routes - validate creator status
  if (isCreatorRoute(pathname)) {
    const isCreator = await validateCreatorStatus(token);

    if (!isCreator) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] User is not a creator, redirecting to /home');
      }
      return redirectToHome(request);
    }
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
