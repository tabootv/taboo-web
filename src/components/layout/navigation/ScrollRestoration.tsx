'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Routes that manage their own scroll behavior
const SCROLL_OPT_OUT_ROUTES = ['/shorts'] as const;

// Transitions between these route pairs use parallel routes — don't scroll to top
const PARALLEL_ROUTE_TRANSITIONS = [{ route: '/posts', origin: '/community' }] as const;

function shouldOptOut(pathname: string | null): boolean {
  if (!pathname) return false;
  return SCROLL_OPT_OUT_ROUTES.some((route) => pathname.startsWith(route));
}

function isParallelRouteTransition(from: string | null, to: string | null): boolean {
  if (!from || !to) return false;
  return PARALLEL_ROUTE_TRANSITIONS.some(
    ({ route, origin }) =>
      (from.startsWith(origin) && to.startsWith(route)) ||
      (from.startsWith(route) && to.startsWith(origin))
  );
}

export function ScrollRestoration() {
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  // Set manual scroll restoration on mount
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []);

  // Handle scroll on route change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevPathnameRef.current = pathname;
      return;
    }

    if (prevPathnameRef.current === pathname) return;
    if (shouldOptOut(pathname) || isParallelRouteTransition(prevPathnameRef.current, pathname)) {
      prevPathnameRef.current = pathname;
      return;
    }

    prevPathnameRef.current = pathname;

    // Use double RAF to ensure DOM has updated after Suspense
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      });
    });
  }, [pathname]);

  return null;
}
