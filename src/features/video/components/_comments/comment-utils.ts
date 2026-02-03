import type { Comment, User } from '@/types';

/**
 * Type guard to validate a comment object has required fields
 */
export function isValidComment(c: unknown): c is Comment {
  if (!c || typeof c !== 'object') return false;
  const comment = c as Partial<Comment>;
  return Boolean(comment.uuid || comment.id) && Boolean(comment.user);
}

/**
 * Generate a stable React key for a comment
 * Falls back to id or index if uuid is missing
 */
export function getCommentKey(comment: Comment, index: number): string {
  return comment.uuid || String(comment.id) || `comment-${index}`;
}

/**
 * Filter and validate an array of comments recursively
 * Removes invalid comments and validates nested replies
 */
export function filterValidComments(comments: unknown[]): Comment[] {
  if (!Array.isArray(comments)) return [];
  return comments.filter(isValidComment).map((c) => ({
    ...c,
    replies: c.replies ? filterValidComments(c.replies) : [],
  }));
}

/**
 * Create an optimistic (pending) comment object
 * Used for immediate UI updates before server response
 */
export function createOptimisticComment(content: string, user: User, parentId?: number): Comment {
  const tempId = Date.now();
  const base = {
    id: tempId,
    uuid: `temp-${tempId}`,
    content,
    user,
    likes_count: 0,
    dislikes_count: 0,
    has_liked: false,
    has_disliked: false,
    replies_count: 0,
    replies: [],
    created_at: 'Just now',
    updated_at: new Date().toISOString(),
    _optimistic: true,
  };
  // Only include parent_id if defined (exactOptionalPropertyTypes)
  return parentId !== undefined ? { ...base, parent_id: parentId } : base;
}
