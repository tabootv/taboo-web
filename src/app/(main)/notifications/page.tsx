'use client';

import { Button, LoadingScreen } from '@/components/ui';
import { useNotifications } from '@/api/queries';
import { useMarkAllNotificationsRead, useDeleteNotification, useDeleteAllNotifications } from '@/api/mutations';
import { useAuthStore } from '@/lib/stores';
import type { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Film, Heart, MessageSquare, Trash2, UserPlus, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data: notificationsList = [], isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();
  const deleteAll = useDeleteAllNotifications();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/sign-in');
    }
  }, [isAuthenticated, router]);

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

  const handleDelete = (id: string) => {
    deleteNotification.mutate(id, {
      onSuccess: () => {
        toast.success('Notification deleted');
      },
      onError: () => {
        toast.error('Failed to delete notification');
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

  if (!isAuthenticated) {
    return <LoadingScreen message="Redirecting..." />;
  }

  if (isLoading) {
    return <LoadingScreen message="Loading notifications..." />;
  }

  const unreadNotifications = notificationsList.filter((n) => n && !n.read_at);
  const readNotifications = notificationsList.filter((n) => n && n.read_at);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-primary/10 rounded-lg">
            <Bell className="w-6 h-6 text-red-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
            <p className="text-sm text-text-secondary">
              {unreadNotifications.length > 0
                ? `${unreadNotifications.length} unread`
                : 'All caught up!'}
            </p>
          </div>
        </div>

        {notificationsList.length > 0 && (
          <div className="flex items-center gap-2">
            {unreadNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-text-secondary hover:text-text-primary"
              >
                <Check className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteAll}
              className="text-red-500 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear all
            </Button>
          </div>
        )}
      </div>

      {unreadNotifications.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <Bell className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">No notifications yet</h2>
          <p className="text-text-secondary">
            When you get notifications, they&apos;ll show up here.
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          {unreadNotifications.length > 0 && (
            <div>
              <div className="px-4 py-3 bg-red-primary/5 border-b border-border">
                <h3 className="text-sm font-semibold text-red-primary">New</h3>
              </div>
              <div className="divide-y divide-border">
                {unreadNotifications.map((notification) => (
                  <NotificationCard
                    key={`${notification.id}${notification.created_at}`}
                    notification={notification}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {readNotifications.length > 0 && (
            <div>
              {unreadNotifications.length > 0 && (
                <div className="px-4 py-3 bg-hover border-b border-border">
                  <h3 className="text-sm font-semibold text-text-secondary">Earlier</h3>
                </div>
              )}
              <div className="divide-y divide-border">
                {readNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationCard({
  notification,
  onDelete,
}: {
  notification: Notification;
  onDelete: (id: string) => void;
}) {
  const isUnread = !notification.read_at;
  const data = notification.data as Record<string, string | number | boolean | undefined>;

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'video':
      case String.raw`App\Notifications\NewVideoNotification`:
        return <Film className="w-5 h-5 text-blue-400" />;
      case 'comment':
      case String.raw`App\Notifications\NewCommentNotification`:
        return <MessageSquare className="w-5 h-5 text-green-400" />;
      case 'like':
      case String.raw`App\Notifications\VideoLikedNotification`:
        return <Heart className="w-5 h-5 text-red-400" />;
      case 'follow':
      case String.raw`App\Notifications\NewFollowerNotification`:
        return <UserPlus className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-text-secondary" />;
    }
  };

  const getNotificationLink = () => {
    if (data.video_uuid) return `/videos/${data.video_uuid}`;
    if (data.series_uuid) return `/series/${data.series_uuid}`;
    if (data.creator_id) return `/creators/creator-profile/${data.creator_id}`;
    return '#';
  };

  const title = (data.title as string) || (data.message as string) || 'New notification';
  const image = data.thumbnail as string | undefined;

  return (
    <div
      className={`flex items-start gap-4 p-4 transition-colors hover:bg-hover group ${
        isUnread ? 'bg-red-primary/5' : ''
      }`}
    >
      <div className="shrink-0">
        {image ? (
          <div className="relative w-12 h-12 rounded-lg overflow-hidden">
            <Image src={image} alt="" fill className="object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-surface-hover flex items-center justify-center">
            {getNotificationIcon()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <Link href={getNotificationLink()} className="block">
          <p
            className={`text-sm ${
              isUnread ? 'text-text-primary font-medium' : 'text-text-secondary'
            }`}
          >
            {title}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </Link>
      </div>

      {isUnread && <div className="w-2 h-2 rounded-full bg-red-primary shrink-0 mt-2" />}

      <button
        onClick={() => onDelete(notification.id)}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-primary/10 text-text-secondary hover:text-red-primary transition-all"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
