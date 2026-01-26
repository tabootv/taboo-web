'use client';

import { videoClient } from '@/api/client/video.client';
import type { Video } from '@/types';
import { Heart } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface LikeButtonProps {
  video: Video;
  onUpdate?: (video: Video) => void;
}

export function LikeButton({ video, onUpdate }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(video.has_liked || false);
  const [likesCount, setLikesCount] = useState(video.likes_count || 0);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleLike = useCallback(async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      await videoClient.toggleLike(video.uuid);

      const newIsLiked = !isLiked;
      const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);

      if (onUpdate) {
        onUpdate({
          ...video,
          has_liked: newIsLiked,
          likes_count: newLikesCount,
        });
      }
    } catch {
      toast.error('Please login to like');
    } finally {
      setIsLoading(false);
    }
  }, [video, isLiked, likesCount, isLoading, onUpdate]);

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading}
      className={`h-9 px-4 flex items-center gap-2 rounded-full transition-all ${
        isLiked ? 'bg-red-primary text-white' : 'bg-surface text-white hover:bg-hover'
      } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      <Heart
        className={`w-5 h-5 transition-transform ${isLiked ? 'fill-current scale-110' : ''}`}
      />
      <span className="text-sm font-medium">{likesCount}</span>
    </button>
  );
}
