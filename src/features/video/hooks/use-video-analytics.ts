'use client';

import posthog from 'posthog-js';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';

interface VideoMetadata {
  title?: string | undefined;
  channelName?: string | undefined;
  contentType?: 'video' | 'short' | 'series_episode' | 'course_lesson' | undefined;
  duration?: number | undefined;
}

/**
 * Hook for video analytics tracking.
 *
 * Tracks play, pause, seek, completion, and other video interaction events via PostHog.
 */
export function useVideoAnalytics(videoId: string, metadata?: VideoMetadata) {
  const trackPlay = () => {
    posthog.capture(AnalyticsEvent.VIDEO_PLAYED, {
      video_id: videoId,
      video_title: metadata?.title,
      channel_name: metadata?.channelName,
      content_type: metadata?.contentType ?? 'video',
      duration: metadata?.duration,
    });
  };

  const trackPause = (currentTime?: number, percentWatched?: number) => {
    posthog.capture(AnalyticsEvent.VIDEO_PAUSED, {
      video_id: videoId,
      current_time: currentTime,
      percent_watched: percentWatched,
    });
  };

  const trackSeek = (time: number, direction?: 'forward' | 'backward', method?: string) => {
    posthog.capture(AnalyticsEvent.VIDEO_SEEKED, {
      video_id: videoId,
      seek_time: time,
      seek_direction: direction,
      seek_method: method,
    });
  };

  const trackCompleted = () => {
    posthog.capture(AnalyticsEvent.VIDEO_COMPLETED, {
      video_id: videoId,
      video_title: metadata?.title,
      channel_name: metadata?.channelName,
      duration: metadata?.duration,
      content_type: metadata?.contentType ?? 'video',
    });
  };

  return {
    trackPlay,
    trackPause,
    trackSeek,
    trackCompleted,
  };
}
