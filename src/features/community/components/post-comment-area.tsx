'use client';

import { postsClient as postsApi } from '@/api/client/posts.client';
import { useAuthStore } from '@/shared/stores/auth-store';
import type { Post, PostComment as PostCommentType } from '@/types';
import { useEffect, useState } from 'react';
import { PostComment } from './post-comment';
import { PostCommentInput } from './post-comment-input';

interface PostCommentAreaProps {
  post: Post;
  showReplySection: boolean;
}

export function PostCommentArea({ post, showReplySection }: PostCommentAreaProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<PostCommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsCount, setCommentsCount] = useState(post.comments_count);

  useEffect(() => {
    if (showReplySection) {
      getComments();
    } else {
      setComments([]);
    }
  }, [showReplySection]);

  const getComments = async () => {
    try {
      const response = await postsApi.getComments(post.id);
      setComments(response.data || []);
    } catch (error) {
      console.error('Failed to get comments:', error);
    }
  };

  const handleCommentDeleted = (commentId: number) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentsCount((prev) => prev - 1);
  };

  const storeComment = async () => {
    if (!newComment.trim()) {
      alert('Comment cannot be empty or just spaces.');
      return;
    }

    try {
      const myComment = await postsApi.postComment(post.id, newComment);
      const commentWithTime = { ...myComment, created_at: 'just now' };
      setComments([commentWithTime, ...comments]);
      setNewComment('');
      setCommentsCount(commentsCount + 1);
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <div>
      <p className="text-sm font-semibold text-text-secondary capitalize">
        {commentsCount} Comments
      </p>

      {/* Comment Input */}
      <div className="mt-3">
        <PostCommentInput
          value={newComment}
          onChange={setNewComment}
          onSubmit={storeComment}
          avatarSrc={user?.small_dp || user?.dp}
          avatarFallback={user?.display_name?.charAt(0) || 'U'}
        />
      </div>

      {/* Comments List */}
      <div className="mt-4 space-y-1">
        {comments.map((comment, index) => (
          <PostComment
            key={comment.id}
            comment={comment}
            index={index}
            onCommentDeleted={handleCommentDeleted}
          />
        ))}
      </div>
    </div>
  );
}
