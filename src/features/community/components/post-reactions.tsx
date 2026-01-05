'use client';

import { useState } from 'react';
import { Heart, ThumbsDown, MessageCircle } from 'lucide-react';
import { posts as postsApi } from '@/lib/api';
import type { Post } from '@/types';

interface PostReactionsProps {
  post: Post;
  onToggleReply: () => void;
}

export function PostReactions({ post, onToggleReply }: PostReactionsProps) {
  const [likeCounter, setLikeCounter] = useState(post.likes_count);
  const [disLikeCounter, setDisLikeCounter] = useState(post.dislikes_count);

  const like = async () => {
    try {
      const response = await postsApi.like(post.id);
      setLikeCounter(response.likes_count);
      setDisLikeCounter(response.dislikes_count);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const dislike = async () => {
    try {
      const response = await postsApi.dislike(post.id);
      setLikeCounter(response.likes_count);
      setDisLikeCounter(response.dislikes_count);
    } catch (error) {
      console.error('Failed to dislike post:', error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Like (Heart) */}
      <button
        onClick={like}
        className="cursor-pointer flex items-center gap-2.5 pl-2 hover:opacity-80 transition-opacity"
      >
        <Heart className="w-5 h-5 text-[#9F9F9F]" />
        <p className="text-[16px] leading-[16px] text-[#9F9F9F]">{likeCounter}</p>
      </button>

      {/* Dislike (ThumbsDown) */}
      <button
        onClick={dislike}
        className="cursor-pointer flex items-center gap-2.5 pl-2 hover:opacity-80 transition-opacity"
      >
        <ThumbsDown className="w-5 h-5 text-[#9F9F9F]" />
        <p className="text-[16px] leading-[16px] text-[#9F9F9F]">{disLikeCounter}</p>
      </button>

      {/* Comments */}
      <button
        onClick={onToggleReply}
        className="cursor-pointer flex items-center gap-2.5 pl-2 hover:opacity-80 transition-opacity"
      >
        <MessageCircle className="w-5 h-5 text-[#9F9F9F]" />
        <p className="text-[16px] leading-[16px] text-[#9F9F9F]">{post.comments_count}</p>
      </button>
    </div>
  );
}
