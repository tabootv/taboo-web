'use client';

import {
  useDeleteAllNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '@/api/mutations';
import { useNotifications } from '@/api/queries';
import { Button, LoadingScreen } from '@/components/ui';
import { getCreatorRoute, getSeriesRoute } from '@/lib/utils';
import type { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Film, Heart, MessageSquare, Trash2, UserPlus, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { data: notificationsList = [], isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markAsRead = useMarkNotificationRead();
  const deleteAll = useDeleteAllNotifications();
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'read'>('all');

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

  if (isLoading) {
    return <LoadingScreen message="Loading notifications..." />;
  }

  const unreadNotifications = (
    Array.isArray(notificationsList) ? notificationsList.flat() : []
  ).filter((n) => n && !n.read_at);
  const readNotifications = (
    Array.isArray(notificationsList) ? notificationsList.flat() : []
  ).filter((n) => n && n.read_at);

  const getFilteredNotifications = () => {
    const allNotifications = Array.isArray(notificationsList) ? notificationsList.flat() : [];

    switch (filterTab) {
      case 'unread':
        return allNotifications.filter((n) => n && !n.read_at);
      case 'read':
        return allNotifications.filter((n) => n && n.read_at);
      default:
        return allNotifications;
    }
  };

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

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteAll}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear all
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterTab === 'all'
                ? 'bg-red-primary text-white'
                : 'bg-surface text-text-secondary hover:bg-hover'
              }`}
          >
            Todas
            {notificationsList.length > 0 && (
              <span className="ml-2 text-xs">({notificationsList.flat().length})</span>
            )}
          </button>
          <button
            onClick={() => setFilterTab('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterTab === 'unread'
                ? 'bg-red-primary text-white'
                : 'bg-surface text-text-secondary hover:bg-hover'
              }`}
          >
            Não Lidas
            {unreadNotifications.length > 0 && (
              <span
                className={`ml-2 text-xs px-1.5 rounded ${filterTab === 'unread' ? 'bg-white/20' : 'bg-red-primary/20'}`}
              >
                {unreadNotifications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterTab('read')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterTab === 'read'
                ? 'bg-red-primary text-white'
                : 'bg-surface text-text-secondary hover:bg-hover'
              }`}
          >
            Lidas
            {readNotifications.length > 0 && (
              <span className="ml-2 text-xs">({readNotifications.length})</span>
            )}
          </button>
        </div>

        {getFilteredNotifications().length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <Bell className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              {filterTab === 'unread'
                ? 'No unread notifications'
                : filterTab === 'read'
                  ? 'No read notifications'
                  : 'No notifications yet'}
            </h2>
            <p className="text-text-secondary">
              {filterTab === 'unread'
                ? "You're all caught up!"
                : filterTab === 'read'
                  ? 'Read notifications will appear here'
                  : "When you get notifications, they'll show up here."}
            </p>
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

function NotificationCard({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) {
  const isUnread = !notification.read_at;

  let dataObj: Record<string, string | number | boolean | undefined> = {};
  let dataString = '';

  if (typeof notification.data === 'string') {
    dataString = notification.data;
    try {
      dataObj = JSON.parse(notification.data);
    } catch { }
  } else if (typeof notification.data === 'object' && notification.data !== null) {
    dataObj = notification.data as Record<string, string | number | boolean | undefined>;
  }

  const mobileMessage = (notification as any).mobile_message as string | undefined;
  const createdBy = (notification as any).created_by as string | undefined;
  const mediaUrl = (notification as any).media_url as string | undefined;
  const modelUuid = (notification as any).model_uuid as string | undefined;

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

  const getNotificationLink = (): string => {
    // Video notifications
    if (modelUuid) {
      if (notification.type === 'NewVideoUploaded') {
        return `/videos/${modelUuid}`;
      }
    }

    // Type-based routing for better accuracy
    const type = notification.type;

    // Follow notifications - link to follower's profile
    if (type === 'follow' || type === String.raw`App\Notifications\NewFollowerNotification`) {
      const handle = dataObj.follower_handle || dataObj.handle || dataObj.handler;
      if (handle) return getCreatorRoute(handle as string);
    }

    // Like/Comment notifications - link to the video
    if (
      type === 'like' ||
      type === 'comment' ||
      type === String.raw`App\Notifications\VideoLikedNotification` ||
      type === String.raw`App\Notifications\NewCommentNotification`
    ) {
      if (dataObj.video_uuid) return `/videos/${dataObj.video_uuid}`;
      if (modelUuid) return `/videos/${modelUuid}`;
    }

    // Video notifications
    if (
      type === 'video' ||
      type === String.raw`App\Notifications\NewVideoNotification`
    ) {
      if (dataObj.video_uuid) return `/videos/${dataObj.video_uuid}`;
      if (modelUuid) return `/videos/${modelUuid}`;
    }

    // Fallback to generic field checks (current behavior)
    if (dataObj.video_uuid) return `/videos/${dataObj.video_uuid}`;
    if (dataObj.series_id && typeof dataObj.series_id !== 'boolean') {
      return getSeriesRoute(dataObj.series_id, dataObj.series_title as string | undefined);
    }
    if (dataObj.series_uuid && typeof dataObj.series_uuid !== 'boolean') {
      return getSeriesRoute(dataObj.series_uuid, dataObj.series_title as string | undefined);
    }
    if (dataObj.creator_handler || dataObj.handler) {
      return getCreatorRoute((dataObj.creator_handler || dataObj.handler) as string);
    }

    return '#';
  };

  const getNotificationMessage = () => {
    if (dataString) {
      return dataString;
    }

    if (mobileMessage) {
      return mobileMessage;
    }

    const message =
      (dataObj.message as string) ||
      (dataObj.body as string) ||
      (dataObj.title as string) ||
      (dataObj.text as string) ||
      (dataObj.content as string);

    if (message) return message;

    switch (notification.type) {
      case 'NewVideoUploaded':
        return `${createdBy || 'Someone'} uploaded a new video`;

      case 'video':
      case String.raw`App\Notifications\NewVideoNotification`:
        return `New video: ${dataObj.video_title || 'Untitled'}`;

      case 'comment':
      case String.raw`App\Notifications\NewCommentNotification`:
        return (
          (dataObj.comment_text as string) || `New comment from ${dataObj.user_name || 'someone'}`
        );

      case 'like':
      case String.raw`App\Notifications\VideoLikedNotification`:
        return `${dataObj.user_name || 'Someone'} liked your video${dataObj.video_title ? `: ${dataObj.video_title}` : ''
          }`;

      case 'follow':
      case String.raw`App\Notifications\NewFollowerNotification`:
        return `${dataObj.follower_name || 'Someone'} started following you`;

      default:
        return 'New notification';
    }
  };

  const title = getNotificationMessage();
  const image = mediaUrl || (dataObj.thumbnail as string | undefined);

  return (
    <div
      className={`flex items-start gap-4 p-4 transition-colors hover:bg-hover group ${isUnread ? 'bg-red-primary/5' : ''
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
            className={`text-sm ${isUnread ? 'text-text-primary font-medium' : 'text-text-secondary'
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

      {isUnread && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMarkRead(notification.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-primary/10 text-text-secondary hover:text-red-primary transition-all"
          title="Mark as read"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
