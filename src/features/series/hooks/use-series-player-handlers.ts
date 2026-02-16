'use client';

import { useToggleAutoplay, useToggleDislike, useToggleLike } from '@/api/mutations';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';
import { getSeriesPlayRoute } from '@/shared/utils/formatting';
import type { Video } from '@/types';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { useCallback, useState } from 'react';
import { useUpNextCountdown } from './use-up-next-countdown';

export function useSeriesPlayerHandlers(
  seriesId: string,
  videoUuid: string,
  nextEpisode: Video | null,
  autoplayEnabled: boolean,
  seriesTitle?: string,
  hasLiked?: boolean,
  previousEpisode?: Video | null
) {
  const router = useRouter();
  const toggleLike = useToggleLike();
  const toggleDislike = useToggleDislike();
  const toggleAutoplay = useToggleAutoplay();
  const [showUpNext, setShowUpNext] = useState(false);

  const navigateToNextEpisode = useCallback(() => {
    if (nextEpisode) {
      posthog.capture(AnalyticsEvent.SERIES_EPISODE_STARTED, {
        series_id: seriesId,
        series_title: seriesTitle,
        episode_uuid: nextEpisode.uuid,
        is_autoplay: true,
      });
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
    posthog.capture(AnalyticsEvent.SERIES_EPISODE_COMPLETED, {
      series_id: seriesId,
      episode_uuid: videoUuid,
    });
    if (autoplayEnabled && nextEpisode) {
      posthog.capture(AnalyticsEvent.SERIES_UP_NEXT_TRIGGERED, {
        series_id: seriesId,
        next_episode_uuid: nextEpisode.uuid,
      });
      setShowUpNext(true);
      upNextCountdown.start();
    }
  }, [autoplayEnabled, nextEpisode, upNextCountdown, seriesId, videoUuid]);

  const handleCancelUpNext = useCallback(() => {
    posthog.capture(AnalyticsEvent.SERIES_UP_NEXT_CANCELLED, { series_id: seriesId });
    upNextCountdown.cancel();
    setShowUpNext(false);
  }, [upNextCountdown, seriesId]);

  const handlePlayNow = useCallback(() => {
    upNextCountdown.playNow();
  }, [upNextCountdown]);

  const playNextVideo = useCallback(() => {
    if (nextEpisode) {
      router.push(getSeriesPlayRoute(seriesId, seriesTitle, nextEpisode.uuid));
    }
  }, [nextEpisode, seriesId, seriesTitle, router]);

  const playPreviousVideo = useCallback(() => {
    if (previousEpisode) {
      router.push(getSeriesPlayRoute(seriesId, seriesTitle, previousEpisode.uuid));
    }
  }, [previousEpisode, seriesId, seriesTitle, router]);

  const handleToggleAutoplay = useCallback(() => {
    toggleAutoplay.mutate();
  }, [toggleAutoplay]);

  const handleLike = useCallback(() => {
    const event = hasLiked ? AnalyticsEvent.VIDEO_LIKE_REMOVED : AnalyticsEvent.VIDEO_LIKED;
    toggleLike.mutate(videoUuid, {
      onSuccess: () => {
        posthog.capture(event, {
          video_id: videoUuid,
          series_id: seriesId,
          content_type: 'series_episode',
        });
      },
    });
  }, [toggleLike, videoUuid, seriesId, hasLiked]);

  const handleDislike = useCallback(() => {
    toggleDislike.mutate(videoUuid);
  }, [toggleDislike, videoUuid]);

  return {
    handleVideoEnded,
    playNextVideo,
    playPreviousVideo,
    handleToggleAutoplay,
    handleLike,
    handleDislike,
    showUpNext,
    upNextCountdown: upNextCountdown.countdown,
    handleCancelUpNext,
    handlePlayNow,
  };
}
