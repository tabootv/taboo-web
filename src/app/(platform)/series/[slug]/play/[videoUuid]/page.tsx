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
import { use, useEffect, useRef, useState } from 'react';

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
  const [autoplayEnabled, setAutoplayEnabled] = useState(playerData.autoplayEnabled);

  useEffect(() => {
    setAutoplayEnabled(playerData.autoplayEnabled);
  }, [playerData.autoplayEnabled]);

  const handlers = useSeriesPlayerHandlers(
    seriesId,
    videoUuid,
    playerData.nextEpisode ?? null,
    autoplayEnabled,
    playerData.seriesData?.title,
    playerData.currentVideo?.has_liked ?? false,
    playerData.previousEpisode ?? null
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
      previousEpisode={playerData.previousEpisode || null}
      isCourse={playerData.isCourse}
      autoplayEnabled={autoplayEnabled}
      handlers={handlers}
      onAutoplayChange={setAutoplayEnabled}
      episodesRef={episodesRef}
    />
  );
}
