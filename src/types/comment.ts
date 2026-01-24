/**
 * Comment Types
 * Video and post comments
 */

import type { User } from './user';
import type { PaginatedResponse } from './api';

export interface Comment {
  id: number;
  uuid: string;
  content: string;
  user: User;
  video_id?: number;
  parent_id?: number;
  likes_count: number;
  dislikes_count: number;
  has_liked: boolean;
  has_disliked: boolean;
  replies_count?: number;
  replies?: Comment[];
  created_at: string;
  updated_at: string;
}

export interface CommentsResponse {
  message: string;
  comments: PaginatedResponse<Comment>;
}

export interface PostComment {
  id: number;
  uuid: string;
  content: string;
  user: User;
  post_id: number;
  parent_id?: number;
  likes_count: number;
  dislikes_count: number;
  has_liked: boolean;
  has_disliked: boolean;
  replies_count?: number;
  replies?: PostComment[];
  created_at: string;
  updated_at: string;
}

export type CommentListResponse = PaginatedResponse<Comment>;
export type PostCommentListResponse = PaginatedResponse<PostComment>;
