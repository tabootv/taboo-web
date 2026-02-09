'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import posthog from 'posthog-js';
import { useToggleBookmark } from '@/api/mutations';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';
import {
  useWatchlistStore,
  type WatchlistItem,
  type WatchlistItemType,
} from '@/shared/stores/watchlist-store';
import type { Video, Series, Course } from '@/types';

const ACTIVE_CLASS = 'bg-white text-black';
const INACTIVE_CLASS = 'bg-white/10 text-white hover:bg-white/15';
const FILL_CLASS = 'fill-current';

interface WatchlistButtonProps {
  item: Video | Series | Course;
  type: WatchlistItemType;
  variant?: 'default' | 'icon-only' | 'pill';
  className?: string;
}

function buildWatchlistItem(item: Video | Series | Course, type: WatchlistItemType): WatchlistItem {
  return {
    id: item.id!,
    uuid: 'uuid' in item ? item.uuid : undefined,
    type,
    title: item.title,
    thumbnail:
      ('thumbnail_webp' in item ? item.thumbnail_webp : null) ||
      ('thumbnail' in item ? item.thumbnail : null) ||
      ('trailer_thumbnail' in item ? item.trailer_thumbnail : null) ||
      null,
    channel:
      'channel' in item && item.channel
        ? { id: item.channel.id, name: item.channel.name, dp: item.channel.dp || null }
        : undefined,
    duration: 'duration' in item && item.duration ? String(item.duration) : undefined,
    videosCount: 'videos_count' in item ? item.videos_count : undefined,
    addedAt: Date.now(),
  };
}

function trackWatchlistEvent(
  added: boolean,
  itemId: number,
  type: WatchlistItemType,
  title: string
) {
  posthog.capture(
    added ? AnalyticsEvent.WATCHLIST_ITEM_ADDED : AnalyticsEvent.WATCHLIST_ITEM_REMOVED,
    { item_id: itemId, item_type: type, title }
  );
}

export function WatchlistButton({
  item,
  type,
  variant = 'default',
  className = '',
}: WatchlistButtonProps) {
  const toggleBookmark = useToggleBookmark();
  const { isInWatchlist, toggleWatchlist } = useWatchlistStore();

  // For videos, use API-backed is_bookmarked with optimistic local state; for series/courses, use local store
  const videoBookmarked =
    type === 'video'
      ? ('is_bookmarked' in item && item.is_bookmarked) ||
        ('in_watchlist' in item && item.in_watchlist) ||
        false
      : false;
  const [optimisticSaved, setOptimisticSaved] = useState(videoBookmarked);
  useEffect(() => {
    if (type === 'video') {
      setOptimisticSaved(videoBookmarked);
    }
  }, [videoBookmarked, type]);

  const inWatchlist = type === 'video' ? optimisticSaved : isInWatchlist(item.id ?? 0, type);

  const handleToggle = useCallback(() => {
    const itemId = item.id;
    if (!itemId) return;

    if (type === 'video' && 'uuid' in item && item.uuid) {
      setOptimisticSaved((prev) => !prev);
      toggleBookmark.mutate(
        { videoUuid: item.uuid, videoId: itemId },
        {
          onSuccess: () => trackWatchlistEvent(!inWatchlist, itemId, type, item.title),
          onError: () => setOptimisticSaved(videoBookmarked),
        }
      );
      return;
    }

    // Local store for series/courses (no backend endpoint for these yet)
    const newState = toggleWatchlist(buildWatchlistItem(item, type));
    trackWatchlistEvent(newState, itemId, type, item.title);
  }, [item, type, toggleBookmark, toggleWatchlist, inWatchlist, videoBookmarked]);

  const isPending = type === 'video' && toggleBookmark.isPending;
  const stateClass = inWatchlist ? ACTIVE_CLASS : INACTIVE_CLASS;
  const title = inWatchlist ? 'Remove from watchlist' : 'Add to watchlist';

  if (variant === 'icon-only') {
    return (
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`p-2 rounded-full transition-colors disabled:opacity-50 ${stateClass} ${className}`}
        title={title}
      >
        <Bookmark className={`w-5 h-5 ${inWatchlist ? FILL_CLASS : ''}`} />
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium rounded-full transition-colors disabled:opacity-50 ${stateClass} ${className}`}
        title={title}
      >
        <Bookmark className={`w-3.5 h-3.5 ${inWatchlist ? FILL_CLASS : ''}`} />
        <span>{inWatchlist ? 'Saved' : 'Save'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`h-[26px] md:h-[30px] px-3 flex items-center gap-1.5 text-sm md:text-base font-normal rounded-full transition-colors disabled:opacity-50 ${stateClass} ${className}`}
      title={title}
    >
      <Bookmark className={`w-4 h-4 md:w-5 md:h-5 ${inWatchlist ? FILL_CLASS : ''}`} />
      <span>{inWatchlist ? 'Saved' : 'Save'}</span>
    </button>
  );
}
