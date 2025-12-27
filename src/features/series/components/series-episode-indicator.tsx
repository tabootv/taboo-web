'use client';

import { Clock } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface SeriesEpisodeIndicatorProps {
  currentEpisodeIndex: number;
  episodesLength: number;
  duration?: number;
  isCourse: boolean;
}

export function SeriesEpisodeIndicator({
  currentEpisodeIndex,
  episodesLength,
  duration,
  isCourse,
}: SeriesEpisodeIndicatorProps) {
  return (
    <div className="flex items-center gap-3 mt-2 text-sm text-white/60">
      <span className="px-2 py-0.5 bg-red-primary/20 text-red-primary rounded font-medium">
        {isCourse ? 'Episode' : 'Part'} {currentEpisodeIndex + 1} of {episodesLength}
      </span>
      {duration && (
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {formatDuration(duration)}
        </span>
      )}
    </div>
  );
}

