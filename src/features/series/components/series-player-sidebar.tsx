'use client';

import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSeriesDetail } from '@/api/queries/series.queries';
import { getSeriesRoute } from '@/lib/utils';
import type { Video } from '@/types';
import { PlayerEpisodeCard } from './player-episode-card';

interface SeriesPlayerSidebarProps {
  seriesId: string;
  seriesData: NonNullable<ReturnType<typeof useSeriesDetail>['data']>;
  episodes: Video[];
  currentVideo: Video;
  currentEpisodeIndex: number;
  isCourse: boolean;
  episodesRef: React.RefObject<HTMLDivElement | null>;
}

export function SeriesPlayerSidebar({
  seriesId,
  seriesData,
  episodes,
  currentVideo,
  currentEpisodeIndex,
  isCourse,
  episodesRef,
}: SeriesPlayerSidebarProps) {
  return (
    <div className="w-full lg:w-[400px] shrink-0">
      <Link
        href={getSeriesRoute(seriesId, seriesData.title)}
        className="flex items-center gap-3 p-3 bg-surface/50 rounded-xl mb-4 group hover:bg-surface/70 transition-colors"
      >
        <div className="relative w-16 h-9 rounded-lg overflow-hidden shrink-0">
          {seriesData.thumbnail && (
            <Image src={seriesData.thumbnail} alt={seriesData.title} fill className="object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/50 mb-0.5">{isCourse ? 'Course' : 'Series'}</p>
          <h3 className="text-sm font-medium text-white truncate group-hover:text-red-primary transition-colors">
            {seriesData.title}
          </h3>
        </div>
        <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/50 transition-colors" />
      </Link>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white">{isCourse ? 'Episodes' : 'All Parts'}</h2>
        <span className="text-sm text-white/50">
          {currentEpisodeIndex + 1}/{episodes.length}
        </span>
      </div>

      <div
        ref={episodesRef}
        className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar"
      >
        {episodes.map((video, index) => (
          <PlayerEpisodeCard
            key={video.uuid}
            video={video}
            episodeNumber={index + 1}
            isCurrent={video.uuid === currentVideo.uuid}
            seriesId={seriesId}
            seriesTitle={seriesData.title}
            isCourse={isCourse}
          />
        ))}
      </div>

      {episodes.length === 0 && (
        <div className="text-center py-12 text-white/40">No episodes available</div>
      )}
    </div>
  );
}

