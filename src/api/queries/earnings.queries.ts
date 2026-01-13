/**
 * Earnings Queries (TanStack Query)
 * For creator affiliate earnings tracking (FirstPromoter integration)
 */

import { useQuery } from '@tanstack/react-query';
import type { EarningsData, DateRange, GroupBy } from '@/types';

/**
 * Calculate date range parameters based on range selection
 */
function getDateParams(range: DateRange, groupBy: GroupBy) {
  const endDate = new Date();
  const startDate = new Date();
  let adjustedGroupBy: GroupBy = groupBy;

  switch (range) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      if (groupBy === 'month') adjustedGroupBy = 'day';
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      if (groupBy === 'day') adjustedGroupBy = 'week';
      break;
    case '365d':
      startDate.setFullYear(endDate.getFullYear() - 1);
      if (groupBy === 'day') adjustedGroupBy = 'month';
      break;
    case 'all':
      startDate.setFullYear(2020, 0, 1);
      adjustedGroupBy = 'month';
      break;
  }

  return {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    group_by: adjustedGroupBy,
  };
}

/**
 * Fetch earnings data from Next.js API route (proxy to FirstPromoter)
 */
async function fetchEarnings(range: DateRange, groupBy: GroupBy): Promise<EarningsData> {
  const params = getDateParams(range, groupBy);
  const searchParams = new URLSearchParams(params);

  const response = await fetch(`/api/creator-studio/earnings?${searchParams}`);

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || 'Failed to fetch earnings data');
  }

  return response.json();
}

/**
 * Hook to get earnings data with caching
 */
export function useEarnings(range: DateRange, groupBy: GroupBy) {
  return useQuery({
    queryKey: ['earnings', range, groupBy],
    queryFn: () => fetchEarnings(range, groupBy),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}
