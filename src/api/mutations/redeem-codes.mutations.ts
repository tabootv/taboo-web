/**
 * Redeem Codes Mutation Hooks
 *
 * TanStack Query mutation hooks for redeem code operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  redeemCodesClient,
  type CreateCodePayload,
  type UpdateCodePayload,
} from '../client/redeem-codes.client';
import { queryKeys } from '../query-keys';

export function useCreateRedeemCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCodePayload) => redeemCodesClient.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.redeemCodes.all });
    },
  });
}

export function useUpdateRedeemCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, payload }: { code: string; payload: UpdateCodePayload }) =>
      redeemCodesClient.update(code, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.redeemCodes.all });
    },
  });
}

export function useActivateRedeemCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => redeemCodesClient.activate(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.redeemCodes.all });
    },
  });
}

export function useDeactivateRedeemCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => redeemCodesClient.deactivate(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.redeemCodes.all });
    },
  });
}

export function useForceDeleteRedeemCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => redeemCodesClient.forceDelete(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.redeemCodes.all });
    },
  });
}
