'use client';

import { LikeButton } from '@/features/video/components/like-button';
import { SaveButton } from '@/features/video/components/save-button';
import type { Video } from '@/types';

interface SeriesActionButtonsProps {
  currentVideo: Video;
}

export function SeriesActionButtons({ currentVideo }: SeriesActionButtonsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <LikeButton video={currentVideo} />
      <SaveButton video={currentVideo} />
    </div>
  );
}
