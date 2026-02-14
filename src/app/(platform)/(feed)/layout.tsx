'use client';

import { Activity } from 'react';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DetailActiveContext } from './_context';

export default function FeedLayout({
  children,
  detail,
}: {
  children: ReactNode;
  detail: ReactNode;
}) {
  const [detailActive, setDetailActive] = useState(false);
  const savedScrollRef = useRef(0);
  const wasActive = useRef(false);
  const pathname = usePathname();

  const handleSetDetailActive = useCallback((active: boolean) => {
    if (active && !wasActive.current) {
      savedScrollRef.current = window.scrollY;
    }
    setDetailActive(active);
  }, []);

  // Reset active state when navigating away from overlay routes
  useEffect(() => {
    if (detailActive && !pathname.startsWith('/posts/')) {
      handleSetDetailActive(false);
    }
  }, [pathname, detailActive, handleSetDetailActive]);

  useEffect(() => {
    if (detailActive && !wasActive.current) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (!detailActive && wasActive.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: savedScrollRef.current, behavior: 'instant' });
        });
      });
    }
    wasActive.current = detailActive;
  }, [detailActive]);

  return (
    <DetailActiveContext.Provider
      value={{ isActive: detailActive, setActive: handleSetDetailActive }}
    >
      <Activity mode={detailActive ? 'hidden' : 'visible'}>{children}</Activity>
      {detail}
    </DetailActiveContext.Provider>
  );
}
