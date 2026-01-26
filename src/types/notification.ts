/**
 * Notification Types
 * User notifications and preferences
 */

export interface Notification {
  id: string;
  type: string;
  data: Record<string, unknown> | string;
  read_at: string | null;
  created_at: string;
  mobile_message?: string;
  created_by?: string;
  media_url?: string;
  profile?: string;
  model_uuid?: string;
  human_readable_time?: string;
}

export interface NotificationsResponse {
  message: string;
  notifications: Notification[];
}
