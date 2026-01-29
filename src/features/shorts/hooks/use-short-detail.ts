import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/query-keys';
import type { ShortVideo } from '@/types';

/**
 * Subscribe to the detail query cache for a specific short.
 * This hook doesn't fetch - it only subscribes to cache updates.
 * Used to get reactive updates when mutations update the cache.
 */
export function useShortDetail(uuid: string): ShortVideo | undefined {
  const { data } = useQuery<ShortVideo>({
    queryKey: queryKeys.shorts.detail(uuid),
    queryFn: () => {
      throw new Error('useShortDetail is cache-only and should not fetch');
    },
    enabled: false, // Subscribe to cache only, don't fetch
    staleTime: Infinity,
  });
  return data;
}
