'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { ContentFilters, VideoStatusFilter, VideoSortOption } from '../_types/filters';

export function useContentFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(
    (): ContentFilters => ({
      status: (searchParams.get('status') as VideoStatusFilter) || 'all',
      sortBy: (searchParams.get('sort') as VideoSortOption) || 'newest',
    }),
    [searchParams]
  );

  const setFilters = useCallback(
    (updates: Partial<ContentFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.status !== undefined) {
        if (updates.status === 'all') {
          params.delete('status');
        } else {
          params.set('status', updates.status);
        }
      }

      if (updates.sortBy !== undefined) {
        if (updates.sortBy === 'newest') {
          params.delete('sort');
        } else {
          params.set('sort', updates.sortBy);
        }
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  return { filters, setFilters };
}
