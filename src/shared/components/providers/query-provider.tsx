'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/shared/lib/api/query-client';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * QueryProvider component that wraps the app with TanStack Query.
 *
 * Provides React Query context and devtools in development.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

