/**
 * FirstPromoter Query Hooks
 *
 * TanStack Query hooks for FirstPromoter-related data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';

const FIRSTPROMOTER_DOMAIN = process.env.NEXT_PUBLIC_FIRSTPROMOTER_DOMAIN || 'payouts.taboo.tv';

interface IframeTokenResponse {
  access_token: string;
}

/**
 * Hook to fetch FirstPromoter iframe token and build the iframe URL
 */
export function useFirstPromoterIframeToken() {
  return useQuery({
    queryKey: queryKeys.studio.iframeToken(),
    queryFn: async (): Promise<IframeTokenResponse> => {
      const res = await fetch('/api/creator/firstpromoter/iframe-token');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load earnings dashboard');
      }

      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    select: (data) => {
      return `https://${FIRSTPROMOTER_DOMAIN}/iframe?tk=${data.access_token}`;
    },
  });
}
