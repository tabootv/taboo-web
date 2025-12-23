'use client';

import { useRef, useCallback, useEffect } from 'react';

interface FetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

interface UseAbortableFetchOptions {
  debounceMs?: number;
}

/**
 * Hook for making fetch requests with automatic abort controller management.
 * Cancels previous requests when a new one is made.
 */
export function useAbortableFetch<T>(options: UseAbortableFetchOptions = {}) {
  const { debounceMs = 0 } = options;
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const fetchData = useCallback(
    async (
      url: string,
      fetchOptions?: RequestInit
    ): Promise<{ data: T | null; error: Error | null; aborted: boolean }> => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear any pending debounce timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Create new abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const doFetch = async (): Promise<{
        data: T | null;
        error: Error | null;
        aborted: boolean;
      }> => {
        try {
          const response = await fetch(url, {
            ...fetchOptions,
            signal: abortController.signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          return { data, error: null, aborted: false };
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            return { data: null, error: null, aborted: true };
          }
          return {
            data: null,
            error: error instanceof Error ? error : new Error('Unknown error'),
            aborted: false,
          };
        }
      };

      // If debounce is set, wait before fetching
      if (debounceMs > 0) {
        return new Promise((resolve) => {
          timeoutRef.current = setTimeout(async () => {
            const result = await doFetch();
            resolve(result);
          }, debounceMs);
        });
      }

      return doFetch();
    },
    [debounceMs]
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { fetchData, abort };
}

/**
 * Creates a standalone abortable fetch function (not a hook)
 */
export function createAbortableFetch() {
  let abortController: AbortController | null = null;

  const fetchData = async <T>(
    url: string,
    options?: RequestInit
  ): Promise<{ data: T | null; error: Error | null; aborted: boolean }> => {
    // Cancel previous request
    if (abortController) {
      abortController.abort();
    }

    abortController = new AbortController();

    try {
      const response = await fetch(url, {
        ...options,
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null, aborted: false };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { data: null, error: null, aborted: true };
      }
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
        aborted: false,
      };
    }
  };

  const abort = () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };

  return { fetchData, abort };
}
