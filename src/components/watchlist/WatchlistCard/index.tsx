'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play, Trash2, Clock } from 'lucide-react';
import {
  formatAddedAt,
  type WatchlistItem,
  type WatchlistItemType,
} from '@/lib/stores/watchlist-store';
import { usePrefetch } from '@/hooks/use-prefetch';
import { getSeriesRoute } from '@/lib/utils';

interface WatchlistCardProps {
  item: WatchlistItem;
  onRemove: (id: number, type: WatchlistItemType) => void;
}

export function WatchlistCard({ item, onRemove }: WatchlistCardProps) {
  const { prefetchRoute } = usePrefetch();

  const getHref = () => {
    if (item.type === 'video') return `/videos/${item.uuid || item.id}`;
    if (item.type === 'series') return getSeriesRoute(item.id, item.title);
    if (item.type === 'course') return `/courses/${item.id}`;
    return '#';
  };

  const getTypeBadge = () => {
    if (item.type === 'video') return 'Video';
    if (item.type === 'series') return 'Series';
    if (item.type === 'course') return 'Course';
    return '';
  };

  const href = getHref();

  return (
    <div className="series-card-clean group relative">
      <Link
        href={href}
        prefetch={true}
        onMouseEnter={() => href !== '#' && prefetchRoute(href)}
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
          {item.thumbnail ? (
            <Image
              src={item.thumbnail}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-dark to-red-primary" />
          )}

          <div className="absolute top-3 left-3 series-type-badge">
            <Play className="w-3 h-3 fill-white" />
            {getTypeBadge()}
          </div>

          {item.progress !== undefined && item.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-red-primary"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          )}

          {(item.duration || item.videosCount) && (
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded text-xs text-white font-medium">
              {item.duration || `${item.videosCount} episodes`}
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col">
          <h3 className="text-base font-medium text-white line-clamp-2 min-h-[48px]">
            {item.title}
          </h3>

          <div className="flex items-center justify-between mt-auto pt-3">
            <div className="flex items-center gap-2">
              {item.channel?.dp ? (
                <Image
                  src={item.channel.dp}
                  alt={item.channel.name || 'Creator'}
                  width={28}
                  height={28}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {(item.channel?.name || 'C').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm text-text-secondary truncate max-w-[100px]">
                {item.channel?.name || 'Creator'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <Clock className="w-3 h-3" />
              {formatAddedAt(item.addedAt)}
            </div>
          </div>
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(item.id, item.type);
        }}
        className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-red-primary rounded-full opacity-0 group-hover:opacity-100 transition-all"
        title="Remove from watchlist"
      >
        <Trash2 className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}

