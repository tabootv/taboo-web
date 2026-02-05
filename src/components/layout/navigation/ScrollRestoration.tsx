'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Routes that manage their own scroll behavior
const SCROLL_OPT_OUT_ROUTES = ['/shorts'] as const;

function shouldOptOut(pathname: string | null): boolean {
  if (!pathname) return false;
  return SCROLL_OPT_OUT_ROUTES.some((route) => pathname.startsWith(route));
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
    if (shouldOptOut(pathname)) {
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
