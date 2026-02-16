'use client';

import { useSeriesDetail } from '@/api/queries/series.queries';
import type { PlayerNavigationControls } from '@/features/video/components/shaka-player/types';
import { VideoComments } from '@/features/video/components/video-comments';
import type { Video } from '@/types';
import { useMemo } from 'react';
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
  previousEpisode: Video | null;
  isCourse: boolean;
  autoplayEnabled: boolean;
  handlers: ReturnType<typeof useSeriesPlayerHandlers>;
  onAutoplayChange?: (enabled: boolean) => void;
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
  previousEpisode,
  isCourse,
  autoplayEnabled,
  handlers,
  onAutoplayChange,
  isDescriptionExpanded,
  setIsDescriptionExpanded,
  shouldTruncateDescription,
}: SeriesPlayerMainContentProps) {
  const navigationControls: PlayerNavigationControls = useMemo(
    () => ({
      onPrevious: handlers.playPreviousVideo,
      onNext: handlers.playNextVideo,
      hasPrevious: !!previousEpisode,
      hasNext: !!nextEpisode,
      autoplayEnabled,
      onAutoplayChange,
    }),
    [
      handlers.playPreviousVideo,
      handlers.playNextVideo,
      previousEpisode,
      nextEpisode,
      autoplayEnabled,
      onAutoplayChange,
    ]
  );

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
        navigationControls={navigationControls}
      />

      <h1 className="text-[1.5rem]! font-semibold text-white mt-4 leading-snug">
        {isCourse ? seriesData.title : currentVideo.title}
      </h1>

      <SeriesEpisodeIndicator
        currentEpisodeIndex={currentEpisodeIndex}
        episodesLength={episodes.length}
        isCourse={isCourse}
      />

      <SeriesChannelAndActions currentVideo={currentVideo} />

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
