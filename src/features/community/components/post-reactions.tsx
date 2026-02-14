'use client';

import { postsClient as postsApi } from '@/api/client/posts.client';
import { cn } from '@/shared/utils/formatting';
import type { Post } from '@/types';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PostReactionsProps {
  post: Post;
  onToggleReply: () => void;
}

const pillBase =
  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-text-secondary transition-all cursor-pointer';

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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Like */}
      <button
        onClick={like}
        className={cn(
          pillBase,
          hasLiked
            ? 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'
            : 'hover:bg-[rgba(239,68,68,0.1)] hover:text-[#ef4444]'
        )}
      >
        <Heart className={cn('w-5 h-5 transition-colors', hasLiked ? 'fill-current' : '')} />
        <span>{likeCounter}</span>
      </button>

      {/* Comment */}
      <button
        onClick={onToggleReply}
        className={cn(pillBase, 'hover:bg-[rgba(34,197,94,0.1)] hover:text-[#22c55e]')}
      >
        <MessageCircle className="w-5 h-5" />
        <span>{post.comments_count}</span>
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        className={cn(pillBase, 'hover:bg-[rgba(59,130,246,0.1)] hover:text-[#3b82f6]')}
      >
        <Share2 className="w-5 h-5" />
        <span>Share</span>
      </button>
    </div>
  );
}
