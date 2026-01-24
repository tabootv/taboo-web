'use client';

import { useState } from 'react';
import { useSeriesDetail } from '@/api/queries/series.queries';
import type { Video } from '@/types';
import { useSeriesPlayerHandlers } from '../hooks/use-series-player-handlers';
import { SeriesBreadcrumb } from './series-breadcrumb';
import { SeriesPlayerMainContent } from './series-player-main-content';
import { SeriesPlayerSidebar } from './series-player-sidebar';

interface SeriesPlayerContentProps {
  seriesId: string;
  currentVideo: Video;
  seriesData: NonNullable<ReturnType<typeof useSeriesDetail>['data']>;
  episodes: Video[];
  currentEpisodeIndex: number;
  nextEpisode: Video | null;
  isCourse: boolean;
  autoplayEnabled: boolean;
  handlers: ReturnType<typeof useSeriesPlayerHandlers>;
  episodesRef: React.RefObject<HTMLDivElement | null>;
}

export function SeriesPlayerContent({
  seriesId,
  currentVideo,
  seriesData,
  episodes,
  currentEpisodeIndex,
  nextEpisode,
  isCourse,
  autoplayEnabled,
  handlers,
  episodesRef,
}: SeriesPlayerContentProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const shouldTruncateDescription =
    currentVideo.description && currentVideo.description.length > 200;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <SeriesBreadcrumb
          seriesId={seriesId}
          seriesTitle={seriesData.title}
          currentEpisodeIndex={currentEpisodeIndex}
          isCourse={isCourse}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <SeriesPlayerMainContent
            currentVideo={currentVideo}
            seriesData={seriesData}
            episodes={episodes}
            currentEpisodeIndex={currentEpisodeIndex}
            nextEpisode={nextEpisode}
            isCourse={isCourse}
            autoplayEnabled={autoplayEnabled}
            handlers={handlers}
            isDescriptionExpanded={isDescriptionExpanded}
            setIsDescriptionExpanded={setIsDescriptionExpanded}
            shouldTruncateDescription={!!shouldTruncateDescription}
          />

          <SeriesPlayerSidebar
            seriesId={seriesId}
            seriesData={seriesData}
            episodes={episodes}
            currentVideo={currentVideo}
            currentEpisodeIndex={currentEpisodeIndex}
            isCourse={isCourse}
            episodesRef={episodesRef}
          />
        </div>
      </div>
    </div>
  );
}

