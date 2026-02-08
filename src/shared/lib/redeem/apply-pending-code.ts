import { subscriptionsClient } from '@/api/client/subscriptions.client';
import { AxiosError } from 'axios';

const STORAGE_KEY = 'redeem_code';

export function saveRedeemCode(code: string): void {
  localStorage.setItem(STORAGE_KEY, code);
}

export function clearRedeemCode(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getPendingRedeemCode(searchParams?: URLSearchParams): string | null {
  return searchParams?.get('redeem_code') || localStorage.getItem(STORAGE_KEY);
}

/**
 * Attempts to apply a pending redeem code after authentication.
 * Returns { applied: false } if no code was found.
 * Returns { applied: true, success, message } after attempting to apply.
 * Always clears localStorage on attempt (success or failure).
 */
export async function applyPendingRedeemCode(
  searchParams?: URLSearchParams
): Promise<{ applied: boolean; success: boolean; message?: string }> {
  const code = getPendingRedeemCode(searchParams);
  if (!code) return { applied: false, success: false };

  try {
    const result = await subscriptionsClient.applyRedeemCode(code);
    clearRedeemCode();
    return { applied: true, success: true, message: result.message };
  } catch (err) {
    clearRedeemCode();
    const message =
      err instanceof AxiosError
        ? err.response?.data?.message || 'Failed to apply redeem code'
        : 'Failed to apply redeem code';
    return { applied: true, success: false, message };
  }
}
