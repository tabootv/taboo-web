import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollPaginationOptions<T> {
  /**
   * Function to fetch the next page of data
   * @param pageOrUrl - Page number or next page URL
   * @returns Promise with data and pagination info
   */
  fetchPage: (pageOrUrl: number | string | null) => Promise<{
    data: T[];
    nextPageUrl?: string | null;
    hasMore?: boolean;
    currentPage?: number;
    lastPage?: number;
  }>;
  /**
   * Initial page number (for page-based pagination)
   * @default 1
   */
  initialPage?: number;
  /**
   * Root margin for IntersectionObserver
   * @default '100px'
   */
  rootMargin?: string;
  /**
   * Threshold for IntersectionObserver
   * @default 0.1
   */
  threshold?: number;
  /**
   * Whether to fetch initial data on mount
   * @default true
   */
  fetchOnMount?: boolean;
}

interface UseInfiniteScrollPaginationResult<T> {
  /** Array of all loaded items */
  items: T[];
  /** Whether initial load is in progress */
  isLoading: boolean;
  /** Whether loading more items */
  isLoadingMore: boolean;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Error message if any */
  error: string | null;
  /** Function to manually load more items */
  loadMore: () => Promise<void>;
  /** Function to reset and reload from the beginning */
  reset: () => void;
  /** Function to set items directly (for optimistic updates) */
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  /** Ref to attach to the element that triggers loading */
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Generic hook for infinite scroll pagination
 * Supports both page-based and URL-based pagination
 */
export function useInfiniteScrollPagination<T>(
  options: UseInfiniteScrollPaginationOptions<T>
): UseInfiniteScrollPaginationResult<T> {
  const {
    fetchPage,
    initialPage = 1,
    rootMargin = '100px',
    threshold = 0.1,
    fetchOnMount = true,
  } = options;

  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(fetchOnMount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track pagination state - can be page number or next URL
  const [nextPage, setNextPage] = useState<number>(initialPage);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const isUrlBased = useRef(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Store fetchPage in a ref to avoid dependency issues
  const fetchPageRef = useRef(fetchPage);
  useEffect(() => {
    fetchPageRef.current = fetchPage;
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const pageOrUrl = isUrlBased.current ? nextPageUrl : nextPage;
      const response = await fetchPageRef.current(pageOrUrl);

      setItems((prev) => [...prev, ...response.data]);

      // Handle URL-based pagination
      if (response.nextPageUrl !== undefined) {
        isUrlBased.current = true;
        setNextPageUrl(response.nextPageUrl);
        setHasMore(!!response.nextPageUrl);
      }
      // Handle page-based pagination
      else if (response.currentPage !== undefined && response.lastPage !== undefined) {
        isUrlBased.current = false;
        const currentPage = response.currentPage;
        const lastPage = response.lastPage;
        setNextPage(currentPage + 1);
        setHasMore(currentPage < lastPage);
      }
      // Fallback: assume hasMore from response or default to false
      else {
        setHasMore(response.hasMore ?? false);
      }
    } catch (err) {
      console.error('Failed to load more items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more items');
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, nextPage, nextPageUrl]);

  const reset = useCallback(() => {
    setItems([]);
    setNextPage(initialPage);
    setNextPageUrl(null);
    setHasMore(true);
    setError(null);
    isUrlBased.current = false;
    setIsLoading(fetchOnMount);
  }, [fetchOnMount, initialPage]);

  // Initial fetch
  useEffect(() => {
    if (!fetchOnMount) return;

    const fetchInitial = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchPageRef.current(initialPage);

        setItems(response.data || []);

        // Determine pagination type from first response
        if (response.nextPageUrl !== undefined) {
          isUrlBased.current = true;
          setNextPageUrl(response.nextPageUrl);
          setHasMore(!!response.nextPageUrl);
        } else if (response.currentPage !== undefined && response.lastPage !== undefined) {
          isUrlBased.current = false;
          const currentPage = response.currentPage;
          const lastPage = response.lastPage;
          setNextPage(currentPage + 1);
          setHasMore(currentPage < lastPage);
        } else {
          setHasMore(response.hasMore ?? false);
        }
      } catch (err) {
        console.error('Failed to fetch initial items:', err);
        setError(err instanceof Error ? err.message : 'Failed to load items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitial();
  }, [fetchOnMount, initialPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore || items.length === 0) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      return;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
            loadMore();
          }
        });
      },
      { root: null, rootMargin, threshold }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasMore, isLoading, isLoadingMore, items.length, loadMore, rootMargin, threshold]);

  return {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    reset,
    setItems,
    loadMoreRef,
  };
}
