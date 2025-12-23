'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, Play, Trash2, Clock } from 'lucide-react';
import {
  useWatchlistStore,
  formatAddedAt,
  type WatchlistItem,
  type WatchlistItemType,
} from '@/lib/stores/watchlist-store';

// Filter categories for watchlist
const filterCategories = [
  { id: 'all', name: 'All' },
  { id: 'video', name: 'Videos' },
  { id: 'series', name: 'Series' },
  { id: 'course', name: 'Courses' },
];

export default function WatchlistPage() {
  const { items, removeItem, getItemsByType } = useWatchlistStore();
  const [activeFilter, setActiveFilter] = useState<WatchlistItemType | 'all'>('all');
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredWatchlist = mounted ? getItemsByType(activeFilter) : [];

  const handleRemoveFromWatchlist = (itemId: number, type: WatchlistItemType) => {
    removeItem(itemId, type);
  };

  // Show skeleton during hydration
  if (!mounted) {
    return (
      <div className="series-page-atmosphere min-h-screen">
        <div className="series-atmosphere-bg" />
        <div className="relative z-10 max-w-[1860px] mx-auto px-4 md:px-8 lg:px-12 py-8 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <Bookmark className="w-8 h-8 text-red-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              My Watchlist
            </h1>
          </div>
          <div className="grid-series mt-10">
            {Array.from({ length: 6 }).map((_, index) => (
              <WatchlistCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="series-page-atmosphere min-h-screen">
      {/* Atmospheric Background */}
      <div className="series-atmosphere-bg" />

      <div className="relative z-10 max-w-[1860px] mx-auto px-4 md:px-8 lg:px-12 py-8 pt-8">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="w-8 h-8 text-red-primary" />
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            My Watchlist
          </h1>
        </div>

        <p className="text-text-secondary mb-8 max-w-2xl">
          Keep track of videos, series, and courses you want to watch later.
        </p>

        {/* Filter Bar */}
        <div className="series-filter-bar mb-10">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1 px-1">
            {filterCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id as WatchlistItemType | 'all')}
                className={`series-filter-pill ${
                  activeFilter === category.id ? 'active' : ''
                }`}
              >
                {category.name}
                {category.id !== 'all' && (
                  <span className="ml-1.5 text-xs opacity-60">
                    ({getItemsByType(category.id as WatchlistItemType).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Watchlist Content */}
        {filteredWatchlist.length > 0 ? (
          <div className="grid-series">
            {filteredWatchlist.map((item) => (
              <WatchlistCard
                key={`${item.type}-${item.id}`}
                item={item}
                onRemove={handleRemoveFromWatchlist}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-full bg-[#131315] flex items-center justify-center mb-6">
              <Bookmark className="w-10 h-10 text-red-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              {activeFilter === 'all'
                ? 'Your watchlist is empty'
                : `No ${activeFilter}s in your watchlist`}
            </h3>
            <p className="text-text-secondary max-w-md mb-8">
              {activeFilter === 'all'
                ? 'Start adding videos, series, and courses to your watchlist to keep track of content you want to watch later.'
                : `You haven't saved any ${activeFilter}s yet. Browse and save content to watch later.`}
            </p>
            <Link href="/home" className="btn btn-primary px-6 py-3">
              Explore Content
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Watchlist Card Component
function WatchlistCard({
  item,
  onRemove,
}: {
  item: WatchlistItem;
  onRemove: (id: number, type: WatchlistItemType) => void;
}) {
  const getHref = () => {
    if (item.type === 'video') return `/videos/${item.uuid || item.id}`;
    if (item.type === 'series') return `/series/${item.uuid || item.id}`;
    // Courses use numeric ID for routing since the backend /courses/{id} endpoint expects numeric ID
    if (item.type === 'course') return `/courses/${item.id}`;
    return '#';
  };

  const getTypeBadge = () => {
    if (item.type === 'video') return 'Video';
    if (item.type === 'series') return 'Series';
    if (item.type === 'course') return 'Course';
    return '';
  };

  return (
    <div className="series-card-clean group relative">
      <Link href={getHref()}>
        {/* Thumbnail */}
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

          {/* Type Badge - Top Left */}
          <div className="absolute top-3 left-3 series-type-badge">
            <Play className="w-3 h-3 fill-white" />
            {getTypeBadge()}
          </div>

          {/* Progress Bar */}
          {item.progress !== undefined && item.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-red-primary"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          )}

          {/* Duration or Episode Count Badge */}
          {(item.duration || item.videosCount) && (
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded text-xs text-white font-medium">
              {item.duration || `${item.videosCount} episodes`}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col">
          {/* Title */}
          <h3 className="text-base font-medium text-white line-clamp-2 min-h-[48px]">
            {item.title}
          </h3>

          {/* Creator Info & Added Date */}
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

            {/* Added Date */}
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <Clock className="w-3 h-3" />
              {formatAddedAt(item.addedAt)}
            </div>
          </div>
        </div>
      </Link>

      {/* Remove Button */}
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

// Skeleton Loader for Cards
function WatchlistCardSkeleton() {
  return (
    <div className="series-card-clean">
      {/* Thumbnail Skeleton */}
      <div className="aspect-video w-full bg-[#1e1f23] rounded-t-xl animate-pulse" />
      {/* Content Skeleton */}
      <div className="p-4">
        <div className="h-5 w-3/4 bg-[#1e1f23] rounded animate-pulse mb-3" />
        <div className="h-5 w-1/2 bg-[#1e1f23] rounded animate-pulse mb-3" />
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#1e1f23] animate-pulse" />
            <div className="h-4 w-20 bg-[#1e1f23] rounded animate-pulse" />
          </div>
          <div className="h-4 w-16 bg-[#1e1f23] rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
