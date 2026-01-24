/**
 * Interaction Types
 * Like, dislike, follow, and bookmark responses
 */

export interface ToggleLikeResponse {
  message: string;
  has_liked: boolean;
  likes_count: number;
}

export interface ToggleDislikeResponse {
  message: string;
  has_disliked: boolean;
  dislikes_count: number;
}

export interface ToggleFollowResponse {
  message: string;
  following: boolean;
  followers_count?: number;
}

export interface LikeResponse {
  has_liked: boolean;
  likes_count: number;
}

export interface DislikeResponse {
  has_disliked: boolean;
  dislikes_count: number;
}

export interface BookmarkResponse {
  is_bookmarked: boolean;
}
