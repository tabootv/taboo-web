/**
 * Community Post Types
 * Posts and post-related content
 */

import type { User } from './user';
import type { Channel } from './channel';
import type { Media } from './media';
import type { PaginatedResponse } from './api';

export interface Post {
  id: number;
  uuid: string;
  caption: string;
  user_id: number;
  published_at?: string;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  has_liked: boolean;
  has_disliked: boolean;
  user: User;
  channel?: Channel;
  post_image?: string[];
  post_audio?: string[];
  media?: Media[];
  created_at: string;
  updated_at: string;
}

export interface PostsResponse {
  message: string;
  posts: PaginatedResponse<Post>;
}

export type PostListResponse = PaginatedResponse<Post>;
