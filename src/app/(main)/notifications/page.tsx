'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bell, X, Trash2, Check, Film, MessageSquare, Heart, UserPlus } from 'lucide-react';
import { notifications as notificationsApi } from '@/lib/api';
import type { Notification } from '@/types';
import { useAuthStore } from '@/lib/stores';
import { Button, LoadingScreen } from '@/components/ui';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.list();
      setNotificationsList(data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/sign-in');
      return;
    }
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, router, fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.readAll();
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      setNotificationsList((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await notificationsApi.deleteAll();
      setNotificationsList([]);
      toast.success('All notifications deleted');
    } catch {
      toast.error('Failed to delete notifications');
    }
  };

  if (!isAuthenticated) {
    return <LoadingScreen message="Redirecting..." />;
  }

  if (isLoading) {
    return <LoadingScreen message="Loading notifications..." />;
  }

  const unreadNotifications = notificationsList.filter((n) => !n.read_at);
  const readNotifications = notificationsList.filter((n) => n.read_at);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
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

      {/* Notifications List */}
      {notificationsList.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <Bell className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">No notifications yet</h2>
          <p className="text-text-secondary">
            When you get notifications, they&apos;ll show up here.
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          {/* Unread Section */}
          {unreadNotifications.length > 0 && (
            <div>
              <div className="px-4 py-3 bg-red-primary/5 border-b border-border">
                <h3 className="text-sm font-semibold text-red-primary">New</h3>
              </div>
              <div className="divide-y divide-border">
                {unreadNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Read Section */}
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

  // Determine notification type and icon
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'video':
      case 'App\\Notifications\\NewVideoNotification':
        return <Film className="w-5 h-5 text-blue-400" />;
      case 'comment':
      case 'App\\Notifications\\NewCommentNotification':
        return <MessageSquare className="w-5 h-5 text-green-400" />;
      case 'like':
      case 'App\\Notifications\\VideoLikedNotification':
        return <Heart className="w-5 h-5 text-red-400" />;
      case 'follow':
      case 'App\\Notifications\\NewFollowerNotification':
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
      {/* Icon or Image */}
      <div className="flex-shrink-0">
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

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Link href={getNotificationLink()} className="block">
          <p className={`text-sm ${isUnread ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
            {title}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </Link>
      </div>

      {/* Unread indicator */}
      {isUnread && (
        <div className="w-2 h-2 rounded-full bg-red-primary flex-shrink-0 mt-2" />
      )}

      {/* Delete button */}
      <button
        onClick={() => onDelete(notification.id)}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-primary/10 text-text-secondary hover:text-red-primary transition-all"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
