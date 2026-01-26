import { useMemo, useState } from 'react';
import type { Notification } from '@/types';

export type FilterTab = 'all' | 'unread' | 'read';

export function useNotificationFilters(notificationsList: Notification[] = []) {
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const allNotifications = useMemo(() => {
    return Array.isArray(notificationsList) ? notificationsList.flat() : [];
  }, [notificationsList]);

  const unreadNotifications = useMemo(() => {
    return allNotifications.filter((n) => n && !n.read_at);
  }, [allNotifications]);

  const readNotifications = useMemo(() => {
    return allNotifications.filter((n) => n && n.read_at);
  }, [allNotifications]);

  const filteredNotifications = useMemo(() => {
    switch (filterTab) {
      case 'unread':
        return unreadNotifications;
      case 'read':
        return readNotifications;
      default:
        return allNotifications;
    }
  }, [filterTab, allNotifications, unreadNotifications, readNotifications]);

  return {
    filterTab,
    setFilterTab,
    allNotifications,
    unreadNotifications,
    readNotifications,
    filteredNotifications,
  };
}
