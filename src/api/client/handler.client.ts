/**
 * Handler Availability API Client
 *
 * API Endpoints:
 * - GET /handler/check/{handler} → { available: boolean, handler: string }
 */

import { apiClient } from './base-client';

export interface HandlerCheckResponse {
  available: boolean;
  handler: string;
}

export const handlerClient = {
  /**
   * Check if a handler (username) is available
   * Public endpoint, no auth required
   */
  checkAvailability: async (handler: string): Promise<HandlerCheckResponse> => {
    return apiClient.get<HandlerCheckResponse>(`/handler/check/${encodeURIComponent(handler)}`);
  },
};
