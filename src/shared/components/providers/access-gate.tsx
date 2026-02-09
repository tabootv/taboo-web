'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/shared/stores/auth-store';

// Paths exempt from gating - accessible regardless of profile/subscription state
const EXEMPT_PATHS = [
  '/choose-plan',
  '/redeem',
  '/account/complete',
  '/account',
  '/account/subscription',
  '/payment',
  '/auth/whop-callback',
];

function isExemptPath(pathname: string): boolean {
  return EXEMPT_PATHS.some((exempt) => pathname === exempt || pathname.startsWith(`${exempt}/`));
}

// Content routes that require subscription (non-profile, non-settings pages)
const NON_CONTENT_PREFIXES = ['/profile', '/settings', '/account'];

function isContentRoute(pathname: string): boolean {
  return !NON_CONTENT_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * AccessGate enforces the onboarding decision tree:
 * 1. Profile incomplete? -> redirect to /account/complete
 * 2. Content route + not subscribed? -> redirect to /choose-plan
 * 3. All pass -> render children
 */
export function AccessGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized, isProfileComplete, isSubscribed, _hasHydrated } =
    useAuthStore();

  // Redirect loop safeguard: track redirects per pathname
  const redirectCountRef = useRef<{ pathname: string; count: number; timestamp: number }>({
    pathname: '',
    count: 0,
    timestamp: 0,
  });

  useEffect(() => {
    // Wait for auth store to be ready
    if (!isInitialized || !_hasHydrated) return;

    // Only gate authenticated users
    if (!isAuthenticated) return;

    // Redirect completed users away from /account/complete
    if (pathname === '/account/complete' && isProfileComplete) {
      router.replace('/');
      return;
    }

    // Never gate exempt paths
    if (isExemptPath(pathname)) return;

    // Redirect loop safeguard
    const now = Date.now();
    const tracker = redirectCountRef.current;
    if (tracker.pathname === pathname && now - tracker.timestamp < 5000) {
      tracker.count++;
      if (tracker.count >= 3) return; // Stop redirecting
    } else {
      redirectCountRef.current = { pathname, count: 0, timestamp: now };
    }

    // 1. Profile incomplete -> /account/complete
    if (!isProfileComplete) {
      redirectCountRef.current.count++;
      router.replace('/account/complete');
      return;
    }

    // 2. Content route + not subscribed -> /choose-plan
    if (isContentRoute(pathname) && !isSubscribed) {
      redirectCountRef.current.count++;
      router.replace('/choose-plan');
      return;
    }
  }, [
    isInitialized,
    _hasHydrated,
    isAuthenticated,
    isProfileComplete,
    isSubscribed,
    pathname,
    router,
  ]);

  return <>{children}</>;
}
