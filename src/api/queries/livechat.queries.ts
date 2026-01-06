/**
 * LiveChat Query Hooks
 *
 * TanStack Query hooks for live chat data fetching
 */

import { useQuery } from '@tanstack/react-query';
import type { LiveChatFilters } from '../client/livechat.client';
import { livechatClient } from '../client/livechat.client';

/**
 * Hook to fetch live chat messages
 *
 * Stale time: 30 seconds (chat messages should be fresh)
 */
export function useLiveChatMessages(filters?: LiveChatFilters) {
  return useQuery({
    queryKey: ['livechat', 'messages', filters],
    queryFn: () => livechatClient.getMessages(filters),
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch platform users count
 *
 * Stale time: 1 minute
 */
export function usePlatformUsersCount() {
  return useQuery({
    queryKey: ['livechat', 'users-count'],
    queryFn: () => livechatClient.getPlatformUsersCount(),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
