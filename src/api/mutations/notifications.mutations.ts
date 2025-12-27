/**
 * Notifications Mutation Hooks
 *
 * TanStack Query mutation hooks for notification operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsClient } from '../client';
import { queryKeys } from '../query-keys';
import type { Notification } from '../types';

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsClient.readAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
    },
  });
}

/**
 * Hook to delete all notifications
 */
export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsClient.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
    },
  });
}

/**
 * Hook to delete a single notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsClient.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() });
      const previous = queryClient.getQueryData<Notification[]>(queryKeys.notifications.list());
      
      if (previous) {
        queryClient.setQueryData<Notification[]>(
          queryKeys.notifications.list(),
          previous.filter((n) => n.id !== id)
        );
      }
      
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.notifications.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
    },
  });
}

