'use client';

import { useEffect, useRef } from 'react';

interface InfiniteScrollLoaderProps {
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  rootMargin?: string;
  threshold?: number;
  skeleton?: React.ReactNode;
}

export function InfiniteScrollLoader({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  rootMargin = '600px',
  threshold = 0,
  skeleton,
}: InfiniteScrollLoaderProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin, threshold }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, rootMargin, threshold]);

  return (
    <>
      {isFetchingNextPage && skeleton}
      <div ref={loadMoreRef} className="h-1" />
    </>
  );
}
