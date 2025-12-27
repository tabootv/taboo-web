'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => Promise<void> | void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number; // Distance from bottom in pixels to trigger load (used for rootMargin)
  rootMargin?: string;
}

export function useInfiniteScroll(options: UseInfiniteScrollOptions) {
  const { onLoadMore, hasMore, isLoading, threshold = 100, rootMargin } = options;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(isLoading);

  // Keep isLoading in sync with ref to avoid stale closures
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isLoadingRef.current) return;
    await onLoadMore();
  }, [hasMore, onLoadMore]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    // Use threshold for rootMargin if custom rootMargin not provided
    const margin = rootMargin ?? `${threshold}px`;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !isLoadingRef.current) {
          handleLoadMore();
        }
      },
      {
        rootMargin: margin,
        threshold: 0,
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleLoadMore, rootMargin, threshold]);

  return { loadMoreRef };
}
