'use client';

import { VideoComments } from '@/features/video/components/video-comments';
import { useSeriesDetail } from '@/api/queries/series.queries';
import type { Video } from '@/types';
import { useSeriesPlayerHandlers } from '../hooks/use-series-player-handlers';
import { SeriesChannelAndActions } from './series-channel-and-actions';
import { SeriesDescription } from './series-description';
import { SeriesEpisodeIndicator } from './series-episode-indicator';
import { SeriesVideoPlayer } from './series-video-player';

interface SeriesPlayerMainContentProps {
  currentVideo: Video;
  seriesData: NonNullable<ReturnType<typeof useSeriesDetail>['data']>;
  episodes: Video[];
  currentEpisodeIndex: number;
  nextEpisode: Video | null;
  isCourse: boolean;
  autoplayEnabled: boolean;
  handlers: ReturnType<typeof useSeriesPlayerHandlers>;
  isDescriptionExpanded: boolean;
  setIsDescriptionExpanded: (expanded: boolean) => void;
  shouldTruncateDescription: boolean;
}

export function SeriesPlayerMainContent({
  currentVideo,
  seriesData,
  episodes,
  currentEpisodeIndex,
  nextEpisode,
  isCourse,
  autoplayEnabled,
  handlers,
  isDescriptionExpanded,
  setIsDescriptionExpanded,
  shouldTruncateDescription,
}: SeriesPlayerMainContentProps) {
  return (
    <div className="flex-1 min-w-0">
      <SeriesVideoPlayer
        currentVideo={currentVideo}
        autoplayEnabled={autoplayEnabled}
        onEnded={handlers.handleVideoEnded}
        nextVideo={nextEpisode}
        showUpNext={handlers.showUpNext}
        countdown={handlers.upNextCountdown}
        onCancelUpNext={handlers.handleCancelUpNext}
        onPlayNow={handlers.handlePlayNow}
      />

      <h1 className="text-lg md:text-xl font-semibold text-white mt-4 leading-snug">
        {isCourse ? seriesData.title : currentVideo.title}
      </h1>

      <SeriesEpisodeIndicator
        currentEpisodeIndex={currentEpisodeIndex}
        episodesLength={episodes.length}
        {...(currentVideo.duration !== undefined && { duration: currentVideo.duration })}
        isCourse={isCourse}
      />

      <SeriesChannelAndActions
        currentVideo={currentVideo}
        autoplayEnabled={autoplayEnabled}
        nextEpisode={nextEpisode}
        handlers={handlers}
      />

      {currentVideo.description && (
        <SeriesDescription
          description={currentVideo.description}
          isExpanded={isDescriptionExpanded}
          onToggle={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          shouldTruncate={shouldTruncateDescription}
        />
      )}

      <div className="mt-6">
        <VideoComments video={currentVideo} initialComments={currentVideo.comments || []} />
      </div>
    </div>
  );
}
