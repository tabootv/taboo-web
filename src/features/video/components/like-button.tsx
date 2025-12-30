'use client';

import { useState, useCallback, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { videos as videosApi } from '@/lib/api';
import { toast } from 'sonner';
import type { Video } from '@/types';

interface LikeButtonProps {
  video: Video;
  onUpdate?: (video: Video) => void;
}

export function LikeButton({ video, onUpdate }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(video.is_liked || false);
  const [likesCount, setLikesCount] = useState(video.likes_count || 0);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state with props when video changes (e.g., after refresh or navigation)
  useEffect(() => {
    setIsLiked(video.is_liked || false);
    setLikesCount(video.likes_count || 0);
  }, [video.uuid, video.is_liked, video.likes_count]);

  const handleToggleLike = useCallback(async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      await videosApi.toggleLike(video.uuid);

      const newIsLiked = !isLiked;
      const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);

      if (onUpdate) {
        onUpdate({
          ...video,
          is_liked: newIsLiked,
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
        isLiked
          ? 'bg-red-primary text-white'
          : 'bg-surface text-white hover:bg-hover'
      } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      <Heart
        className={`w-5 h-5 transition-transform ${isLiked ? 'fill-current scale-110' : ''}`}
      />
      <span className="text-sm font-medium">{likesCount}</span>
    </button>
  );
}
