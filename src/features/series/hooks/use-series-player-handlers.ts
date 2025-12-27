'use client';

import { useToggleAutoplay, useToggleDislike, useToggleLike } from '@/api/mutations';
import type { Video } from '@/types';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useSeriesPlayerHandlers(
  seriesId: string,
  videoUuid: string,
  nextEpisode: Video | null,
  autoplayEnabled: boolean
) {
  const router = useRouter();
  const toggleLike = useToggleLike();
  const toggleDislike = useToggleDislike();
  const toggleAutoplay = useToggleAutoplay();

  const handleVideoEnded = useCallback(() => {
    if (autoplayEnabled && nextEpisode) {
      router.push(`/series/${seriesId}/play/${nextEpisode.uuid}`);
    }
  }, [autoplayEnabled, nextEpisode, seriesId, router]);

  const playNextVideo = useCallback(() => {
    if (nextEpisode) {
      router.push(`/series/${seriesId}/play/${nextEpisode.uuid}`);
    }
  }, [nextEpisode, seriesId, router]);

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

