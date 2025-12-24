'use client';

import { useState, useCallback } from 'react';
import { Flame, Trash2 } from 'lucide-react';
import { videos as videosApi } from '@/lib/api';
import type { Video } from '@/types';

interface LikeDislikeButtonGroupProps {
  video: Video;
  onUpdate?: (video: Video) => void;
}

export function LikeDislikeButtonGroup({ video, onUpdate }: LikeDislikeButtonGroupProps) {
  const [localVideo, setLocalVideo] = useState(video);

  const toggleLike = useCallback(async () => {
    try {
      await videosApi.toggleLike(localVideo.uuid);
      const updatedVideo = { ...localVideo };

      if (localVideo.is_disliked) {
        updatedVideo.is_disliked = false;
        updatedVideo.dislikes_count = (updatedVideo.dislikes_count || 0) - 1;
      }

      if (localVideo.is_liked) {
        updatedVideo.is_liked = false;
        updatedVideo.likes_count = (updatedVideo.likes_count || 0) - 1;
      } else {
        updatedVideo.is_liked = true;
        updatedVideo.likes_count = (updatedVideo.likes_count || 0) + 1;
      }

      setLocalVideo(updatedVideo);
      onUpdate?.(updatedVideo);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  }, [localVideo, onUpdate]);

  const toggleDislike = useCallback(async () => {
    try {
      await videosApi.toggleDislike(localVideo.uuid);
      const updatedVideo = { ...localVideo };

      if (localVideo.is_liked) {
        updatedVideo.is_liked = false;
        updatedVideo.likes_count = (updatedVideo.likes_count || 0) - 1;
      }

      if (localVideo.is_disliked) {
        updatedVideo.is_disliked = false;
        updatedVideo.dislikes_count = (updatedVideo.dislikes_count || 0) - 1;
      } else {
        updatedVideo.is_disliked = true;
        updatedVideo.dislikes_count = (updatedVideo.dislikes_count || 0) + 1;
      }

      setLocalVideo(updatedVideo);
      onUpdate?.(updatedVideo);
    } catch (error) {
      console.error('Failed to toggle dislike:', error);
    }
  }, [localVideo, onUpdate]);

  return (
    <div className="flex items-center min-w-fit max-w-[115px] md:max-w-[150px] font-bold">
      <button
        onClick={toggleLike}
        className={`h-[26px] md:h-[30px] px-3 flex items-center gap-1 text-sm md:text-base font-normal rounded-l-full border-r border-text-secondary/30 transition-colors ${
          localVideo.is_liked
            ? 'bg-red-primary text-white'
            : 'bg-white/10 text-white hover:bg-white/15'
        }`}
      >
        <Flame className="w-4 h-4 md:w-5 md:h-5" />
        <span>{localVideo.likes_count || 0}</span>
      </button>
      <button
        onClick={toggleDislike}
        className={`h-[26px] md:h-[30px] px-3 flex items-center gap-1 text-sm md:text-base font-normal rounded-r-full transition-colors ${
          localVideo.is_disliked
            ? 'bg-red-primary text-white'
            : 'bg-white/10 text-white hover:bg-white/15'
        }`}
      >
        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
        <span>{localVideo.dislikes_count || 0}</span>
      </button>
    </div>
  );
}
