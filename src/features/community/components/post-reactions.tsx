'use client';

import { postsClient as postsApi } from '@/api/client/posts.client';
import type { Post } from '@/types';
import { Flame, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface PostReactionsProps {
  post: Post;
  onToggleReply: () => void;
}

export function PostReactions({ post, onToggleReply }: PostReactionsProps) {
  const [likeCounter, setLikeCounter] = useState(post.likes_count);
  const [hasLiked, setHasLiked] = useState(post.has_liked);

  const like = async () => {
    try {
      const response = await postsApi.like(post.id);
      setLikeCounter(response.likes_count);
      setHasLiked(!hasLiked);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Like (Fire) */}
      <button
        onClick={like}
        className="cursor-pointer flex items-center gap-1 pl-2 hover:opacity-80 transition-opacity"
      >
        <Flame
          className={`w-5 h-5 transition-colors ${
            hasLiked ? 'text-red-primary fill-red-primary' : 'text-[#9F9F9F]'
          }`}
        />
        <p
          className={`text-[16px] leading-[16px] transition-colors ${
            hasLiked ? 'text-red-primary' : 'text-[#9F9F9F]'
          }`}
        >
          {likeCounter}
        </p>
      </button>

      {/* Comments */}
      <button
        onClick={onToggleReply}
        className="cursor-pointer flex items-center gap-1 pl-2 hover:opacity-80 transition-opacity"
      >
        <MessageCircle className="w-5 h-5 text-[#9F9F9F]" />
        <p className="text-[16px] leading-[16px] text-[#9F9F9F]">{post.comments_count}</p>
      </button>
    </div>
  );
}
