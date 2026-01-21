'use client';

import { Play, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Video } from '@/types';
import { useSeriesPlayerHandlers } from '../hooks/use-series-player-handlers';

interface SeriesActionButtonsProps {
  currentVideo: Video;
  autoplayEnabled: boolean;
  nextEpisode: Video | null;
  handlers: ReturnType<typeof useSeriesPlayerHandlers>;
}

export function SeriesActionButtons({
  currentVideo,
  autoplayEnabled,
  nextEpisode,
  handlers,
}: SeriesActionButtonsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center bg-surface rounded-full overflow-hidden">
        <button
          onClick={handlers.handleLike}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-r-full transition-colors',
            currentVideo.has_liked
              ? 'text-red-primary bg-red-primary/10'
              : 'text-white hover:bg-white/10'
          )}
        >
          <ThumbsUp className={cn('w-5 h-5', currentVideo.has_liked && 'fill-current')} />
          <span className="text-sm font-medium">{currentVideo.likes_count || 0}</span>
        </button>
      </div>

      <button
        onClick={handlers.handleToggleAutoplay}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-surface text-white text-sm font-medium"
      >
        <span className="hidden sm:inline">Autoplay</span>
        <div
          className={cn(
            'relative w-10 h-5 rounded-full transition-colors',
            autoplayEnabled ? 'bg-red-primary' : 'bg-white/20'
          )}
        >
          <div
            className={cn(
              'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
              autoplayEnabled ? 'translate-x-5' : 'translate-x-0.5'
            )}
          />
        </div>
      </button>

      {nextEpisode && (
        <button
          onClick={handlers.playNextVideo}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-medium rounded-full transition-all hover:bg-white/90 text-sm"
        >
          <Play className="w-4 h-4 fill-black" />
          <span className="hidden sm:inline">Next</span>
        </button>
      )}
    </div>
  );
}

