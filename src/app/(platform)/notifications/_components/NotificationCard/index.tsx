'use client';

import { AnalyticsEvent } from '@/shared/lib/analytics/events';
import type { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Trash2, X } from 'lucide-react';
import posthog from 'posthog-js';
import Image from 'next/image';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getNotificationIconConfig,
  getNotificationLink,
  getNotificationMessage,
  parseNotificationData,
} from '../../_utils/notification.utils';

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationCard({ notification, onMarkRead, onDelete }: NotificationCardProps) {
  const isUnread = !notification.read_at;
  const parsed = parseNotificationData(notification);
  const link = getNotificationLink(notification, parsed);
  const message = getNotificationMessage(notification, parsed);
  const image = parsed.mediaUrl || (parsed.dataObj.thumbnail as string | undefined);
  const iconConfig = getNotificationIconConfig(notification.type);

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
            <iconConfig.Icon className={`w-5 h-5 ${iconConfig.color}`} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <Link
          href={link}
          className="block"
          onClick={() => {
            posthog.capture(AnalyticsEvent.NOTIFICATION_CLICKED, {
              notification_type: notification.type,
              is_unread: isUnread,
            });
          }}
        >
          <p
            className={`text-sm ${
              isUnread ? 'text-text-primary font-medium' : 'text-text-secondary'
            }`}
          >
            {message}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </Link>
      </div>

      {isUnread && <div className="w-2 h-2 rounded-full bg-red-primary shrink-0 mt-2" />}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-primary/10 text-text-secondary hover:text-red-primary transition-all"
            title="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isUnread && (
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMarkRead(notification.id);
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Mark as read
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="text-red-500 focus:text-red-500"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
