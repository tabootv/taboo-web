/**
 * Moderation API Client
 *
 * API Endpoints:
 * - POST /report → { message: string }
 * - POST /block → { message: string }
 * - POST /block/users/{uuid} → { message: string }
 */

import type { BlockData, ReportData } from '@/types';
import { apiClient } from './base-client';

export const moderationClient = {
  /**
   * Report content
   */
  report: async (reportData: ReportData): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>('/report', reportData);
  },

  /**
   * Block content
   */
  blockContent: async (blockData: BlockData): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>('/block', blockData);
  },

  /**
   * Block a user
   */
  blockUser: async (uuid: string): Promise<{ message: string }> => {
    return await apiClient.post<{ message: string }>(`/block/users/${uuid}`);
  },
};
