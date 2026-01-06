/**
 * LiveChat API Client
 *
 * API Endpoints:
 * - GET /live-chat/messages → PaginatedResponse<ChatMessage>
 * - POST /live-chat/messages → ChatMessage
 * - GET /live-chat/platform-users-count → { count: number }
 */

import type { ChatMessage } from '@/types';
import type { ApiResponse, PaginatedResponse } from '../types';
import { apiClient } from './base-client';

export interface LiveChatFilters extends Record<string, unknown> {
  page?: number;
}

export const livechatClient = {
  /**
   * Get paginated list of chat messages
   */
  getMessages: async (filters?: LiveChatFilters): Promise<PaginatedResponse<ChatMessage>> => {
    const data = await apiClient.get<{
      messages?: PaginatedResponse<ChatMessage>;
    }>('/live-chat/messages', {
      params: filters,
    });
    return data.messages || (data as unknown as PaginatedResponse<ChatMessage>);
  },

  /**
   * Send a message to live chat
   */
  sendMessage: async (content: string): Promise<ChatMessage> => {
    const data = await apiClient.post<ApiResponse<ChatMessage>>('/live-chat/messages', {
      content,
    });
    return data.data;
  },

  /**
   * Get count of users currently on the platform
   */
  getPlatformUsersCount: async (): Promise<{ count: number }> => {
    return await apiClient.get<{ count: number }>('/live-chat/platform-users-count');
  },
};
