/**
 * Redeem Codes API Client (Creator Studio)
 *
 * API Endpoints:
 * - GET    /redeem-codes           → ListCodesResponse
 * - POST   /redeem-codes           → RedeemCode | RedeemCode[]
 * - PATCH  /redeem-codes/{code}    → RedeemCode
 * - PATCH  /redeem-codes/{code}/activate  → RedeemCode
 * - DELETE /redeem-codes/{code}    → void (deactivate)
 * - DELETE /redeem-codes/{code}/force     → void (permanent delete)
 */

import { apiClient } from './base-client';

export interface RedeemCode {
  id: number;
  uuid: string;
  code: string;
  type: 'invite' | 'gift';
  value: number;
  description: string | null;
  redirect_url: string | null;
  max_uses: number | null;
  uses_count: number;
  is_active: boolean;
  start_date: string | null;
  expiry_date: string | null;
  created_at: string;
}

export interface RedeemCodeLimits {
  singleUse: { max: number; used: number; remaining: number; period: string };
  multiUse: { max: number; used: number; remaining: number; period: string; maxUses: number };
}

export interface ListCodesResponse {
  codes: RedeemCode[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  limits: RedeemCodeLimits | undefined;
  channelHandler: string;
}

export interface CreateCodePayload {
  type: 'gift' | 'invite';
  value: number;
  max_uses?: number;
  quantity?: number;
  expiry_date?: string;
  start_date?: string;
  redirect_url?: string;
  description?: string;
}

export interface UpdateCodePayload {
  code?: string;
  expiry_date?: string;
}

export interface ListCodesParams {
  page?: number;
  type?: 'single' | 'multi';
}

export const redeemCodesClient = {
  list: async (params?: ListCodesParams): Promise<ListCodesResponse> => {
    const raw = await apiClient.get<Record<string, unknown>>('/redeem-codes', {
      params: params as Record<string, unknown>,
    });

    // Handle both shapes:
    // Shape A: { success, data: { codes, pagination, limits } }
    // Shape B: { codes, pagination, limits } (flat)
    const payload =
      raw && typeof raw === 'object' && 'data' in raw && raw.data && typeof raw.data === 'object'
        ? (raw.data as Record<string, unknown>)
        : raw;

    return {
      codes: Array.isArray(payload.codes) ? (payload.codes as RedeemCode[]) : [],
      pagination: (payload.pagination as ListCodesResponse['pagination']) ?? {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
      },
      limits: payload.limits as RedeemCodeLimits | undefined,
      channelHandler: (payload.channelHandler as string) ?? '',
    };
  },

  create: async (payload: CreateCodePayload): Promise<{ data: RedeemCode | RedeemCode[] }> => {
    return apiClient.post<{ data: RedeemCode | RedeemCode[] }>('/redeem-codes', payload);
  },

  update: async (code: string, payload: UpdateCodePayload): Promise<{ data: RedeemCode }> => {
    return apiClient.patch<{ data: RedeemCode }>(`/redeem-codes/${code}`, payload);
  },

  activate: async (code: string): Promise<{ data: RedeemCode }> => {
    return apiClient.patch<{ data: RedeemCode }>(`/redeem-codes/${code}/activate`);
  },

  deactivate: async (code: string): Promise<void> => {
    return apiClient.delete<void>(`/redeem-codes/${code}`);
  },

  forceDelete: async (code: string): Promise<void> => {
    return apiClient.delete<void>(`/redeem-codes/${code}/force`);
  },
};
