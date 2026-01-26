import { Bell, Film, Heart, MessageSquare, UserPlus, type LucideIcon } from 'lucide-react';

export type NotificationType =
  | 'video'
  | 'comment'
  | 'like'
  | 'follow'
  | 'NewVideoUploaded'
  | 'App\\Notifications\\NewVideoNotification'
  | 'App\\Notifications\\NewCommentNotification'
  | 'App\\Notifications\\VideoLikedNotification'
  | 'App\\Notifications\\NewFollowerNotification';

export const NOTIFICATION_TYPE_MAP: Record<string, NotificationType> = {
  video: 'video',
  'App\\Notifications\\NewVideoNotification': 'video',
  comment: 'comment',
  'App\\Notifications\\NewCommentNotification': 'comment',
  like: 'like',
  'App\\Notifications\\VideoLikedNotification': 'like',
  follow: 'follow',
  'App\\Notifications\\NewFollowerNotification': 'follow',
  NewVideoUploaded: 'video',
};

export interface IconConfig {
  Icon: LucideIcon;
  color: string;
}

export const NOTIFICATION_ICON_CONFIG: Record<NotificationType, IconConfig> = {
  video: {
    Icon: Film,
    color: 'text-blue-400',
  },
  comment: {
    Icon: MessageSquare,
    color: 'text-green-400',
  },
  like: {
    Icon: Heart,
    color: 'text-red-400',
  },
  follow: {
    Icon: UserPlus,
    color: 'text-purple-400',
  },
  NewVideoUploaded: {
    Icon: Film,
    color: 'text-blue-400',
  },
  'App\\Notifications\\NewVideoNotification': {
    Icon: Film,
    color: 'text-blue-400',
  },
  'App\\Notifications\\NewCommentNotification': {
    Icon: MessageSquare,
    color: 'text-green-400',
  },
  'App\\Notifications\\VideoLikedNotification': {
    Icon: Heart,
    color: 'text-red-400',
  },
  'App\\Notifications\\NewFollowerNotification': {
    Icon: UserPlus,
    color: 'text-purple-400',
  },
};

export const DEFAULT_ICON_CONFIG: IconConfig = {
  Icon: Bell,
  color: 'text-text-secondary',
};
