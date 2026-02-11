/**
 * Users API Client
 *
 * API Endpoints:
 * - GET /users/search?q={query} → MentionUser[]
 * - GET /user/handler/{handler} → User
 */

import type { MentionUser, PublicUser, UserSearchResponse } from '@/types/mention';
import { apiClient } from './base-client';

export const usersClient = {
  searchUsers: async (query: string): Promise<MentionUser[]> => {
    if (query.length < 4 || query.length > 20) return [];

    const response = await apiClient.get<UserSearchResponse>('/users/search', {
      params: { q: query } as Record<string, unknown>,
    });
    return response.users || [];
  },

  getUserByHandler: async (handler: string): Promise<PublicUser> => {
    const response = await apiClient.get<{ user: PublicUser }>(`/user/handler/${handler}`);
    return response.user;
  },
};
