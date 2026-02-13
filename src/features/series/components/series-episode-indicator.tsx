'use client';

interface SeriesEpisodeIndicatorProps {
  currentEpisodeIndex: number;
  episodesLength: number;
  isCourse: boolean;
}

export function SeriesEpisodeIndicator({
  currentEpisodeIndex,
  episodesLength,
  isCourse,
}: SeriesEpisodeIndicatorProps) {
  return (
    <div className="flex items-center gap-3 mt-2 text-sm text-white/60">
      <span className="px-2 py-0.5 bg-red-primary/20 text-red-primary rounded font-medium">
        {isCourse ? 'Episode' : 'Part'} {currentEpisodeIndex + 1} of {episodesLength}
      </span>
    </div>
  );
}
