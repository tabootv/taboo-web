'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationProgress() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const prevPathnameRef = useRef(pathname);
  const isShortsPage = pathname?.startsWith('/shorts');
  const isVideoPage = pathname?.startsWith('/videos/');
  const isImmersiveRoute = isShortsPage || isVideoPage;

  useEffect(() => {
    if (isImmersiveRoute) {
      prevPathnameRef.current = pathname;
      setIsLoading(false);
      setProgress(0);
      return;
    }

    if (prevPathnameRef.current === pathname) {
      return;
    }

    prevPathnameRef.current = pathname;
    setIsLoading(true);
    setProgress(0);

    const timer = setTimeout(() => setProgress(30), 50);
    const timer2 = setTimeout(() => setProgress(60), 200);
    const timer3 = setTimeout(() => setProgress(85), 400);

    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 150);
    }, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(completeTimer);
    };
  }, [pathname, isImmersiveRoute]);

  if (isImmersiveRoute || (!isLoading && progress === 0)) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-red-primary transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: '0 0 10px rgba(171, 0, 19, 0.5)',
        }}
      />
    </div>
  );
}
