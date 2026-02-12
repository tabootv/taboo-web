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
  const [isActive, setActive] = useState(false);
  const savedScrollRef = useRef(0);
  const wasActive = useRef(false);
  const pathname = usePathname();

  const handleSetActive = useCallback((active: boolean) => {
    if (active && !wasActive.current) {
      // Save scroll BEFORE re-render hides content via Activity
      savedScrollRef.current = window.scrollY;
    }
    setActive(active);
  }, []);

  // Reset active state when navigating away from a post detail route
  useEffect(() => {
    if (isActive && !pathname.startsWith('/posts/')) {
      handleSetActive(false);
    }
  }, [pathname, isActive, handleSetActive]);

  useEffect(() => {
    if (isActive && !wasActive.current) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (!isActive && wasActive.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: savedScrollRef.current, behavior: 'instant' });
        });
      });
    }
    wasActive.current = isActive;
  }, [isActive]);

  return (
    <DetailActiveContext.Provider value={{ isActive, setActive: handleSetActive }}>
      <Activity mode={isActive ? 'hidden' : 'visible'}>{children}</Activity>
      {detail}
    </DetailActiveContext.Provider>
  );
}
