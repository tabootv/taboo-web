'use client';

import { useToggleAutoplay, useToggleDislike, useToggleLike } from '@/api/mutations';
import { getSeriesPlayRoute } from '@/lib/utils';
import type { Video } from '@/types';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useUpNextCountdown } from './use-up-next-countdown';

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
  const [showUpNext, setShowUpNext] = useState(false);

  const navigateToNextEpisode = useCallback(() => {
    if (nextEpisode) {
      setShowUpNext(false);
      const route = getSeriesPlayRoute(seriesId, seriesTitle, nextEpisode.uuid);
      router.push(`${route}?autoplay=true`);
    }
  }, [nextEpisode, seriesId, seriesTitle, router]);

  const upNextCountdown = useUpNextCountdown({
    initialSeconds: 5,
    onComplete: navigateToNextEpisode,
  });

  const handleVideoEnded = useCallback(() => {
    if (autoplayEnabled && nextEpisode) {
      setShowUpNext(true);
      upNextCountdown.start();
    }
  }, [autoplayEnabled, nextEpisode, upNextCountdown]);

  const handleCancelUpNext = useCallback(() => {
    upNextCountdown.cancel();
    setShowUpNext(false);
  }, [upNextCountdown]);

  const handlePlayNow = useCallback(() => {
    upNextCountdown.playNow();
  }, [upNextCountdown]);

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
    showUpNext,
    upNextCountdown: upNextCountdown.countdown,
    handleCancelUpNext,
    handlePlayNow,
  };
}

