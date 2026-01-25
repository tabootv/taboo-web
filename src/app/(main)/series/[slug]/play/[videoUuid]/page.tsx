'use client';

import { PlayerPageSkeleton } from '../../../_components/PlayerPageSkeleton';
import {
  SeriesPlayerContent,
  SeriesPlayerErrorState,
  useEpisodeScroll,
  useSeriesPlayerData,
  useSeriesPlayerHandlers,
} from '@/features/series';
import { extractIdFromSlug, isValidId } from '@/shared/utils/formatting';
import { use, useEffect, useRef } from 'react';

export default function SeriesPlayerPage({
  params,
}: {
  params: Promise<{ slug: string; videoUuid: string }>;
}) {
  const { slug, videoUuid } = use(params);
  const seriesId = extractIdFromSlug(slug);
  const isValid = isValidId(seriesId);
  const episodesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [videoUuid]);

  const playerData = useSeriesPlayerData(isValid ? seriesId : '', videoUuid);
  const handlers = useSeriesPlayerHandlers(
    seriesId,
    videoUuid,
    playerData.nextEpisode ?? null,
    playerData.autoplayEnabled,
    playerData.seriesData?.title
  );

  useEpisodeScroll(episodesRef, playerData.currentEpisodeIndex);

  // Validate the extracted ID after hooks
  if (!isValid) {
    return <SeriesPlayerErrorState />;
  }

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
