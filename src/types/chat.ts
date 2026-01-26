/**
 * Live Chat Types
 * Chat messages and chatroom types
 */

import type { User } from './user';
import type { PaginatedResponse } from './api';

export interface ChatMessage {
  id: number;
  uuid: string;
  content: string;
  user: User;
  chatroom_id: number;
  created_at: string;
}

export interface ChatMessagesResponse {
  message: string;
  messages: PaginatedResponse<ChatMessage>;
}

export interface Chatroom {
  id: number;
  name: string;
  active: boolean;
}

export interface PlatformUsersCountResponse {
  message: string;
  count: number;
}
