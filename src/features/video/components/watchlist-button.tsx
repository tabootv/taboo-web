'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bookmark } from 'lucide-react';
import posthog from 'posthog-js';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';
import {
  useWatchlistStore,
  type WatchlistItem,
  type WatchlistItemType,
} from '@/shared/stores/watchlist-store';
import type { Video, Series, Course } from '@/types';

interface WatchlistButtonProps {
  item: Video | Series | Course;
  type: WatchlistItemType;
  variant?: 'default' | 'icon-only' | 'pill';
  className?: string;
}

export function WatchlistButton({
  item,
  type,
  variant = 'default',
  className = '',
}: WatchlistButtonProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlistStore();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [mounted, setMounted] = useState(false);

  const itemId = item.id;

  useEffect(() => {
    setMounted(true);
    if (itemId) {
      setInWatchlist(isInWatchlist(itemId, type));
    }
  }, [isInWatchlist, itemId, type]);

  const handleToggle = useCallback(() => {
    if (!itemId) return;

    // Build the watchlist item based on type
    const watchlistItem: WatchlistItem = {
      id: itemId,
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
          ? {
              id: item.channel.id,
              name: item.channel.name,
              dp: item.channel.dp || null,
            }
          : undefined,
      duration: 'duration' in item && item.duration ? String(item.duration) : undefined,
      videosCount: 'videos_count' in item ? item.videos_count : undefined,
      addedAt: Date.now(),
    };

    const newState = toggleWatchlist(watchlistItem);
    posthog.capture(
      newState ? AnalyticsEvent.WATCHLIST_ITEM_ADDED : AnalyticsEvent.WATCHLIST_ITEM_REMOVED,
      {
        item_id: itemId,
        item_type: type,
        title: item.title,
      }
    );
    setInWatchlist(newState);
  }, [item, itemId, type, toggleWatchlist]);

  if (!mounted) {
    // SSR placeholder
    if (variant === 'icon-only') {
      return (
        <button disabled className={`p-2 rounded-full bg-white/10 text-white ${className}`}>
          <Bookmark className="w-5 h-5" />
        </button>
      );
    }

    return (
      <button
        disabled
        className={`h-[26px] md:h-[30px] px-3 flex items-center gap-1.5 text-sm md:text-base font-normal rounded-full bg-white/10 text-white ${className}`}
      >
        <Bookmark className="w-4 h-4 md:w-5 md:h-5" />
        <span>Save</span>
      </button>
    );
  }

  // Icon only variant
  if (variant === 'icon-only') {
    return (
      <button
        onClick={handleToggle}
        className={`p-2 rounded-full transition-colors ${
          inWatchlist ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/15'
        } ${className}`}
        title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        <Bookmark className={`w-5 h-5 ${inWatchlist ? 'fill-current' : ''}`} />
      </button>
    );
  }

  // Pill variant (compact)
  if (variant === 'pill') {
    return (
      <button
        onClick={handleToggle}
        className={`px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium rounded-full transition-colors ${
          inWatchlist ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/15'
        } ${className}`}
        title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        <Bookmark className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-current' : ''}`} />
        <span>{inWatchlist ? 'Saved' : 'Save'}</span>
      </button>
    );
  }

  // Default variant
  return (
    <button
      onClick={handleToggle}
      className={`h-[26px] md:h-[30px] px-3 flex items-center gap-1.5 text-sm md:text-base font-normal rounded-full transition-colors ${
        inWatchlist ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/15'
      } ${className}`}
      title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      <Bookmark className={`w-4 h-4 md:w-5 md:h-5 ${inWatchlist ? 'fill-current' : ''}`} />
      <span>{inWatchlist ? 'Saved' : 'Save'}</span>
    </button>
  );
}
