'use client';

import { useToggleBookmark } from '@/api/mutations';
import { useBookmarkedVideos } from '@/api/queries/video.queries';
import {
  useWatchlistStore,
  type WatchlistItem,
  type WatchlistItemType,
} from '@/shared/stores/watchlist-store';
import { formatDuration, getSeriesRoute } from '@/shared/utils/formatting';
import type { Video } from '@/types';
import { Bookmark, Play, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

type FilterType = 'all' | 'video' | 'series' | 'course';

const filterTabs: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'video', label: 'Videos' },
  { key: 'series', label: 'Series' },
  { key: 'course', label: 'Courses' },
];

export default function WatchlistPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // API-backed videos from watchlist
  const { data: watchlistData, isLoading } = useBookmarkedVideos(1, 50);
  const apiVideos = watchlistData?.data || [];

  // Local store for series/courses (no backend endpoint for these yet)
  const { getItemsByType, removeItem } = useWatchlistStore();
  const localSeries = getItemsByType('series');
  const localCourses = getItemsByType('course');

  const handleRemoveLocal = (itemId: number, type: WatchlistItemType) => {
    removeItem(itemId, type);
  };

  const getCount = (type: FilterType) => {
    if (type === 'video') return apiVideos.length;
    if (type === 'series') return localSeries.length;
    if (type === 'course') return localCourses.length;
    return apiVideos.length + localSeries.length + localCourses.length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto page-px py-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-7 h-7 text-red-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">My Watchlist</h1>
          </div>
          <p className="text-text-secondary mb-8">Keep track of content you want to watch later.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-video w-full bg-white/5 rounded-lg animate-pulse" />
                <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const showVideos = activeFilter === 'all' || activeFilter === 'video';
  const showSeries = activeFilter === 'all' || activeFilter === 'series';
  const showCourses = activeFilter === 'all' || activeFilter === 'course';

  const totalCount = getCount('all');

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto page-px py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="w-7 h-7 text-red-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-white">My Watchlist</h1>
        </div>
        <p className="text-text-secondary mb-6">Keep track of content you want to watch later.</p>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar border-b border-white/5 mb-8">
          {filterTabs.map((tab) => {
            const count = getCount(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeFilter === tab.key
                    ? 'text-white border-red-primary'
                    : 'text-white/50 border-transparent hover:text-white/80'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeFilter === tab.key
                        ? 'bg-red-primary/20 text-red-primary'
                        : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {totalCount > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {showVideos &&
              apiVideos.map((video) => (
                <ApiVideoCard key={`video-${video.uuid || video.id}`} video={video} />
              ))}
            {showSeries &&
              localSeries.map((item) => (
                <LocalWatchlistCard
                  key={`series-${item.id}`}
                  item={item}
                  onRemove={handleRemoveLocal}
                />
              ))}
            {showCourses &&
              localCourses.map((item) => (
                <LocalWatchlistCard
                  key={`course-${item.id}`}
                  item={item}
                  onRemove={handleRemoveLocal}
                />
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Bookmark className="w-8 h-8 text-red-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {activeFilter === 'all' ? 'Your watchlist is empty' : `No ${activeFilter}s saved`}
            </h3>
            <p className="text-text-secondary max-w-md mb-6">
              {activeFilter === 'all'
                ? 'Start adding videos, series, and courses to watch later.'
                : `You haven't saved any ${activeFilter}s yet.`}
            </p>
            <Link
              href="/"
              className="px-6 py-2.5 bg-red-primary hover:bg-red-hover rounded-full text-sm font-medium text-white transition-colors"
            >
              Explore Content
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ApiVideoCard({ video }: { video: Video }) {
  const toggleBookmark = useToggleBookmark();

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!video.uuid) return;
    toggleBookmark.mutate({ videoUuid: video.uuid, videoId: video.id });
  };

  return (
    <div className="group relative">
      <Link href={`/videos/${video.uuid || video.id}`} className="block">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-surface">
          {(video.thumbnail_webp || video.thumbnail) && (
            <Image
              src={video.thumbnail_webp || video.thumbnail || ''}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          {video.duration && (
            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded font-medium">
              {formatDuration(video.duration)}
            </span>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
            <div className="p-3 bg-red-primary/90 rounded-full">
              <Play className="w-5 h-5 text-white" fill="white" />
            </div>
          </div>
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded capitalize">
            Video
          </span>
        </div>
        <div className="mt-2">
          <h3 className="font-medium text-white line-clamp-2 text-sm group-hover:text-red-primary transition-colors">
            {video.title}
          </h3>
          {video.channel?.name && (
            <p className="text-xs text-text-secondary mt-1">{video.channel.name}</p>
          )}
        </div>
      </Link>
      <button
        onClick={handleRemove}
        disabled={toggleBookmark.isPending}
        className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-primary rounded-full opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
        title="Remove from watchlist"
      >
        <Trash2 className="w-3.5 h-3.5 text-white" />
      </button>
    </div>
  );
}

function LocalWatchlistCard({
  item,
  onRemove,
}: {
  item: WatchlistItem;
  onRemove: (id: number, type: WatchlistItemType) => void;
}) {
  const getHref = () => {
    if (item.type === 'series') return getSeriesRoute(item.id, item.title);
    if (item.type === 'course') return `/courses/${item.id}`;
    return `/videos/${item.id}`;
  };
  const href = getHref();

  return (
    <div className="group relative">
      <Link href={href} className="block">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-surface">
          {item.thumbnail && (
            <Image
              src={item.thumbnail}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          {item.duration && (
            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded font-medium">
              {formatDuration(
                typeof item.duration === 'string' ? parseInt(item.duration, 10) : item.duration
              )}
            </span>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
            <div className="p-3 bg-red-primary/90 rounded-full">
              <Play className="w-5 h-5 text-white" fill="white" />
            </div>
          </div>
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded capitalize">
            {item.type}
          </span>
        </div>
        <div className="mt-2">
          <h3 className="font-medium text-white line-clamp-2 text-sm group-hover:text-red-primary transition-colors">
            {item.title}
          </h3>
          {item.channel?.name && (
            <p className="text-xs text-text-secondary mt-1">{item.channel.name}</p>
          )}
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(item.id, item.type);
        }}
        className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-primary rounded-full opacity-0 group-hover:opacity-100 transition-all"
        title="Remove from watchlist"
      >
        <Trash2 className="w-3.5 h-3.5 text-white" />
      </button>
    </div>
  );
}
