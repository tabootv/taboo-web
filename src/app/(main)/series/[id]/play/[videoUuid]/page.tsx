'use client';

import { PlayerPageSkeleton } from '@/components/series';
import {
  SeriesPlayerContent,
  SeriesPlayerErrorState,
  useEpisodeScroll,
  useSeriesPlayerData,
  useSeriesPlayerHandlers,
} from '@/features/series';
import { use, useEffect, useRef } from 'react';

export default function SeriesPlayerPage({
  params,
}: {
  params: Promise<{ id: string; videoUuid: string }>;
}) {
  const { id: seriesId, videoUuid } = use(params);
  const episodesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [videoUuid]);

  const playerData = useSeriesPlayerData(seriesId, videoUuid);
  const handlers = useSeriesPlayerHandlers(
    seriesId,
    videoUuid,
    playerData.nextEpisode ?? null,
    playerData.autoplayEnabled
  );

  useEpisodeScroll(episodesRef, playerData.currentEpisodeIndex);

  if (playerData.isLoading) {
    return <PlayerPageSkeleton />;
  }

  if (!playerData.seriesData || !playerData.currentVideo) {
    return <SeriesPlayerErrorState />;
  }

  return (
    <SeriesPlayerContent
      seriesId={seriesId}
      currentVideo={playerData.currentVideo}
      seriesData={playerData.seriesData}
      episodes={playerData.episodes}
      currentEpisodeIndex={playerData.currentEpisodeIndex}
      nextEpisode={playerData.nextEpisode || null}
      isCourse={playerData.isCourse}
      autoplayEnabled={playerData.autoplayEnabled}
      handlers={handlers}
      episodesRef={episodesRef}
    />
  );
}
