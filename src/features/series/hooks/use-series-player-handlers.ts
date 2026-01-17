'use client';

import { useToggleAutoplay, useToggleDislike, useToggleLike } from '@/api/mutations';
import { getSeriesPlayRoute } from '@/lib/utils';
import type { Video } from '@/types';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useSeriesPlayerHandlers(
  seriesId: string,
  videoUuid: string,
  nextEpisode: Video | null,
  autoplayEnabled: boolean,
  seriesTitle?: string
) {
  const router = useRouter();
  const toggleLike = useToggleLike();
  const toggleDislike = useToggleDislike();
  const toggleAutoplay = useToggleAutoplay();

  const handleVideoEnded = useCallback(() => {
    if (autoplayEnabled && nextEpisode) {
      router.push(getSeriesPlayRoute(seriesId, seriesTitle, nextEpisode.uuid));
    }
  }, [autoplayEnabled, nextEpisode, seriesId, seriesTitle, router]);

  const playNextVideo = useCallback(() => {
    if (nextEpisode) {
      router.push(getSeriesPlayRoute(seriesId, seriesTitle, nextEpisode.uuid));
    }
  }, [nextEpisode, seriesId, seriesTitle, router]);

  const handleToggleAutoplay = useCallback(() => {
    toggleAutoplay.mutate();
  }, [toggleAutoplay]);

  const handleLike = useCallback(() => {
    toggleLike.mutate(videoUuid);
  }, [toggleLike, videoUuid]);

  const handleDislike = useCallback(() => {
    toggleDislike.mutate(videoUuid);
  }, [toggleDislike, videoUuid]);

  return {
    handleVideoEnded,
    playNextVideo,
    handleToggleAutoplay,
    handleLike,
    handleDislike,
  };
}

