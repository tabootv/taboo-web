/**
 * Notifications Query Hooks
 *
 * TanStack Query hooks for notification-related data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { notificationsClient } from '../client';
import { queryKeys } from '../query-keys';

/**
 * Hook to fetch notifications list
 * Stale time: 30 seconds (real-time feel)
 */
export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => notificationsClient.list(),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

/**
 * Hook to fetch notification contact preferences
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: queryKeys.notifications.preferences(),
    queryFn: () => notificationsClient.getContactPreferences(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

