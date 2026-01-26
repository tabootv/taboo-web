'use client';

import {
  useDeleteAllNotifications,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '@/api/mutations';
import { useNotifications } from '@/api/queries/notifications.queries';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/spinner';
import { Bell, Check } from 'lucide-react';
import { toast } from 'sonner';
import { DeleteAllConfirmation } from './_components/DeleteAllConfirmation';
import { NotificationCard } from './_components/NotificationCard';
import { NotificationFilters } from './_components/NotificationFilters';
import { useNotificationFilters } from './_hooks/useNotificationFilters';

export default function NotificationsPage() {
  const { data: notificationsList = [], isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markAsRead = useMarkNotificationRead();
  const deleteAll = useDeleteAllNotifications();
  const deleteOne = useDeleteNotification();

  const { filterTab, setFilterTab, unreadNotifications, readNotifications, filteredNotifications } =
    useNotificationFilters(notificationsList);

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => {
        toast.success('All notifications marked as read');
      },
      onError: () => {
        toast.error('Failed to mark notifications as read');
      },
    });
  };

  const handleDeleteAll = () => {
    deleteAll.mutate(undefined, {
      onSuccess: () => {
        toast.success('All notifications deleted');
      },
      onError: () => {
        toast.error('Failed to delete notifications');
      },
    });
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id, {
      onSuccess: () => {
        toast.success('Marked as read');
      },
      onError: () => {
        toast.error('Failed to mark as read');
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteOne.mutate(id, {
      onSuccess: () => {
        toast.success('Notification deleted');
      },
      onError: () => {
        toast.error('Failed to delete notification');
      },
    });
  };

  if (isLoading) {
    return <LoadingScreen message="Loading notifications..." />;
  }

  const getEmptyStateMessage = () => {
    if (filterTab === 'unread') {
      return {
        title: 'No unread notifications',
        message: "You're all caught up!",
      };
    }
    if (filterTab === 'read') {
      return {
        title: 'No read notifications',
        message: 'Read notifications will appear here',
      };
    }
    return {
      title: 'No notifications yet',
      message: "When you get notifications, they'll show up here.",
    };
  };

  const emptyState = getEmptyStateMessage();

  return (
    <div className="w-full px-[4%] py-8">
      <div className="max-w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Notifications</h1>
            <p className="text-sm text-text-secondary mt-1">
              {unreadNotifications.length > 0
                ? `${unreadNotifications.length} unread`
                : 'All caught up!'}
            </p>
          </div>

          {notificationsList.length > 0 && (
            <div className="flex items-center gap-2">
              {unreadNotifications.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllRead}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark all read
                  </Button>

                  <DeleteAllConfirmation
                    onConfirm={handleDeleteAll}
                    disabled={deleteAll.isPending}
                  />
                </>
              )}
            </div>
          )}
        </div>

        <NotificationFilters
          filterTab={filterTab}
          onFilterChange={setFilterTab}
          allCount={filteredNotifications.length}
          unreadCount={unreadNotifications.length}
          readCount={readNotifications.length}
        />

        {filteredNotifications.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <Bell className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-text-primary mb-2">{emptyState.title}</h2>
            <p className="text-text-secondary">{emptyState.message}</p>
          </div>
        ) : (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            {(filterTab === 'all' || filterTab === 'unread') && unreadNotifications.length > 0 && (
              <div>
                <div className="px-4 py-3 bg-red-primary/5 border-b border-border">
                  <h3 className="text-sm font-semibold text-red-primary">New</h3>
                </div>
                <div className="divide-y divide-border">
                  {unreadNotifications.map((notification) => (
                    <NotificationCard
                      key={`${notification.id}${notification.created_at}`}
                      notification={notification}
                      onMarkRead={handleMarkAsRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {(filterTab === 'all' || filterTab === 'read') && readNotifications.length > 0 && (
              <div>
                {unreadNotifications.length > 0 && filterTab === 'all' && (
                  <div className="px-4 py-3 bg-hover border-b border-border">
                    <h3 className="text-sm font-semibold text-text-secondary">Earlier</h3>
                  </div>
                )}
                <div className="divide-y divide-border">
                  {readNotifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkRead={handleMarkAsRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
