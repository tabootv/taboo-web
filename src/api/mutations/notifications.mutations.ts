/**
 * Notifications Mutation Hooks
 *
 * TanStack Query mutation hooks for notification operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsClient } from '../client/notifications.client';
import { queryKeys } from '../query-keys';
import type { Notification } from '../types';

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsClient.readAll(),

    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<Notification[]>(queryKeys.notifications.list());

      // Optimistically mark all as read
      if (previousData) {
        const now = new Date().toISOString();
        queryClient.setQueryData<Notification[]>(
          queryKeys.notifications.list(),
          previousData.map((n) => (n.read_at ? n : { ...n, read_at: now }))
        );
      }

      return { previousData };
    },

    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.notifications.list(), context.previousData);
      }
    },

    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
    },
  });
}

/**
 * Hook to mark a single notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsClient.read(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() });
      const previous = queryClient.getQueryData<Notification[]>(queryKeys.notifications.list());

      if (previous) {
        queryClient.setQueryData<Notification[]>(
          queryKeys.notifications.list(),
          previous.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
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
