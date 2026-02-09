'use client';

import { useFeature } from '@/hooks/use-feature';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';
import { useSavedVideosStore, type SavedVideo } from '@/shared/stores/saved-videos-store';
import type { Video } from '@/types';
import { Bookmark } from 'lucide-react';
import posthog from 'posthog-js';
import { useCallback, useEffect, useState } from 'react';

interface SaveButtonProps {
  video: Video;
}

export function SaveButton({ video }: SaveButtonProps) {
  const bookmarksEnabled = useFeature('BOOKMARK_SYSTEM');

  const { isSaved, toggleSave } = useSavedVideosStore();
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (video.id) {
      setSaved(isSaved(video.id));
    }
  }, [isSaved, video.id]);

  const handleToggle = useCallback(() => {
    if (!video.id) return;

    const savedVideo: SavedVideo = {
      id: video.id,
      title: video.title,
      thumbnail: video.thumbnail_webp || video.thumbnail || null,
      channelName: video.channel?.name || null,
      savedAt: Date.now(),
    };
    const newState = toggleSave(savedVideo);
    posthog.capture(newState ? AnalyticsEvent.VIDEO_SAVED : AnalyticsEvent.VIDEO_UNSAVED, {
      video_id: video.id,
      video_title: video.title,
    });
    setSaved(newState);
  }, [video, toggleSave]);

  if (!bookmarksEnabled) return null;

  const baseClasses =
    'inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full border border-white/10 bg-white/5 text-white transition-colors';

  const activeClasses = saved
    ? 'bg-white text-black border-white/30'
    : 'hover:bg-white/10 hover:border-white/20';

  return (
    <button
      onClick={handleToggle}
      aria-label={saved ? 'Saved' : 'Save'}
      disabled={!mounted}
      className={`${baseClasses} ${activeClasses} disabled:opacity-60`}
    >
      <Bookmark className={`w-4 h-4 md:w-5 md:h-5 ${saved ? 'fill-current' : ''}`} />
    </button>
  );
}
