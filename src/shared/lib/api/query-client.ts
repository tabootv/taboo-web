import { QueryClient } from '@tanstack/react-query';

/**
 * Centralized QueryClient configuration for TanStack Query.
 *
 * Provides default options for queries including stale time,
 * garbage collection time, and retry strategies.
 *
 * Domain-specific stale times:
 * - Video metadata: 30 minutes (rarely changes)
 * - User profile: 5 minutes
 * - Notifications: 30 seconds (real-time feel)
 * - Home feed: 10 minutes
 * - Search results: 5 minutes
 * - Creators: 1 hour (rarely changes)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: (query) => {
        const key = query.queryKey[0] as string;

        // Video metadata: long cache (rarely changes)
        if (key === 'videos' && query.queryKey[1] === 'detail') {
          return 1000 * 60 * 30; // 30 minutes
        }

        // Notifications: short cache (real-time feel)
        if (key === 'notifications') {
          return 1000 * 30; // 30 seconds
        }

        // Home feed: medium cache
        if (key === 'home') {
          return 1000 * 60 * 10; // 10 minutes
        }

        // Search results: medium cache
        if (key === 'search') {
          return 1000 * 60 * 5; // 5 minutes
        }

        // User profile: medium cache
        if (key === 'auth') {
          return 1000 * 60 * 5; // 5 minutes
        }

        // Creators: long cache (rarely changes)
        if (key === 'creators') {
          return 1000 * 60 * 60; // 1 hour
        }

        // Default: 5 minutes
        return 1000 * 60 * 5;
      },
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchInterval: (query) => {
        const key = query.queryKey[0] as string;

        // Notifications: poll every 30 seconds
        if (key === 'notifications') {
          return 1000 * 30;
        }

        return false;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
