import { getCreatorRoute, getSeriesRoute } from '@/shared/utils/formatting';
import type { Notification } from '@/types';
import {
  DEFAULT_ICON_CONFIG,
  NOTIFICATION_ICON_CONFIG,
  NOTIFICATION_TYPE_MAP,
  type NotificationType,
} from './notification.constants';

export interface ParsedNotificationData {
  dataObj: Record<string, string | number | boolean | undefined>;
  dataString: string;
  mobileMessage: string | undefined;
  createdBy: string | undefined;
  mediaUrl: string | undefined;
  modelUuid: string | undefined;
}

export function parseNotificationData(notification: Notification): ParsedNotificationData {
  let dataObj: Record<string, string | number | boolean | undefined> = {};
  let dataString = '';

  if (typeof notification.data === 'string') {
    dataString = notification.data;
    try {
      dataObj = JSON.parse(notification.data);
    } catch {
      // If parsing fails, dataObj remains empty
    }
  } else if (typeof notification.data === 'object' && notification.data !== null) {
    dataObj = notification.data as Record<string, string | number | boolean | undefined>;
  }

  const mobileMessage = notification.mobile_message;
  const createdBy = notification.created_by;
  const mediaUrl = notification.media_url;
  const modelUuid = notification.model_uuid;

  return {
    dataObj,
    dataString,
    mobileMessage,
    createdBy,
    mediaUrl,
    modelUuid,
  };
}

export function getNormalizedType(type: string): NotificationType | null {
  return NOTIFICATION_TYPE_MAP[type] || null;
}

export function getNotificationLink(
  notification: Notification,
  parsed: ParsedNotificationData
): string {
  const { dataObj, modelUuid } = parsed;
  const normalizedType = getNormalizedType(notification.type);

  if (modelUuid && notification.type === 'NewVideoUploaded') {
    return `/videos/${modelUuid}`;
  }

  if (normalizedType === 'follow') {
    const handle = dataObj.follower_handle || dataObj.handle || dataObj.handler;
    if (handle) {
      return getCreatorRoute(handle as string);
    }
  }

  if (normalizedType === 'like' || normalizedType === 'comment') {
    if (dataObj.video_uuid) return `/videos/${dataObj.video_uuid}`;
    if (modelUuid) return `/videos/${modelUuid}`;
  }

  if (normalizedType === 'video') {
    if (dataObj.video_uuid) return `/videos/${dataObj.video_uuid}`;
    if (modelUuid) return `/videos/${modelUuid}`;
  }

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
}

export function getNotificationMessage(
  notification: Notification,
  parsed: ParsedNotificationData
): string {
  const { dataString, mobileMessage, dataObj, createdBy } = parsed;

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

  if (message) {
    return message;
  }

  const normalizedType = getNormalizedType(notification.type);

  if (notification.type === 'NewVideoUploaded') {
    return `${createdBy || 'Someone'} uploaded a new video`;
  }

  if (normalizedType === 'video') {
    return `New video: ${dataObj.video_title || 'Untitled'}`;
  }

  if (normalizedType === 'comment') {
    return (dataObj.comment_text as string) || `New comment from ${dataObj.user_name || 'someone'}`;
  }

  if (normalizedType === 'like') {
    return `${dataObj.user_name || 'Someone'} liked your video${
      dataObj.video_title ? `: ${dataObj.video_title}` : ''
    }`;
  }

  if (normalizedType === 'follow') {
    return `${dataObj.follower_name || 'Someone'} started following you`;
  }

  return 'New notification';
}

export function getNotificationIconConfig(type: string) {
  const normalizedType = getNormalizedType(type);
  if (normalizedType && NOTIFICATION_ICON_CONFIG[normalizedType]) {
    const config = NOTIFICATION_ICON_CONFIG[normalizedType];
    return {
      Icon: config.Icon,
      color: config.color,
    };
  }
  return {
    Icon: DEFAULT_ICON_CONFIG.Icon,
    color: DEFAULT_ICON_CONFIG.color,
  };
}
