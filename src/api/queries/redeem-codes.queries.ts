/**
 * Redeem Codes Query Hooks
 *
 * TanStack Query hooks for redeem codes data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { redeemCodesClient, type ListCodesParams } from '../client/redeem-codes.client';
import { queryKeys } from '../query-keys';

export function useRedeemCodes(params?: ListCodesParams) {
  return useQuery({
    queryKey: queryKeys.redeemCodes.list(params as Record<string, unknown>),
    queryFn: () => redeemCodesClient.list(params),
    staleTime: 1000 * 60 * 5,
  });
}
