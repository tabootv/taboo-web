'use client';

import { postsClient as postsApi } from '@/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { Post, PostComment as PostCommentType } from '@/types';
import { Send } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { PostComment } from './post-comment';

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

  const storeComment = async () => {
    if (!newComment.trim()) {
      alert('Comment cannot be empty or just spaces.');
      return;
    }

    try {
      const myComment = await postsApi.postComment(post.id, newComment);
      // Set created_at to 'just now' for display
      const commentWithTime = { ...myComment, created_at: 'just now' };
      setComments([commentWithTime, ...comments]);
      setNewComment('');
      setCommentsCount(commentsCount + 1);
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      storeComment();
    }
  };

  return (
    <div>
      <p className="text-[20px] font-medium font-bold">{commentsCount} comments</p>

      {/* Comment Input */}
      <div className="flex items-start gap-[21px] mt-[4px] md:mt-[25px]">
        <div className="relative size-[30px] md:size-[48px] rounded-full overflow-hidden bg-surface flex-shrink-0">
          {user?.small_dp || user?.dp ? (
            <Image
              src={user.small_dp || user.dp || ''}
              alt={user.display_name || 'You'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="size-full flex items-center justify-center bg-red-primary text-white text-xs md:text-sm font-medium">
              {user?.display_name?.charAt(0) || 'U'}
            </div>
          )}
        </div>

        <div className="flex items-end w-full">
          <textarea
            placeholder="Add Comment"
            rows={1}
            className="flex-1 bg-transparent border-b border-white/30 focus:border-white/60 outline-none resize-none py-2 text-white placeholder:text-white/50"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={storeComment} className="p-2 hover:bg-white/10 rounded-full">
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="mt-4">
        {comments.map((comment, index) => (
          <PostComment key={comment.id} comment={comment} index={index} />
        ))}
      </div>
    </div>
  );
}
