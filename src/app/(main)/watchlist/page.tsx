'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { WatchlistCard, WatchlistCardSkeleton } from '@/components/watchlist';
import {
  useWatchlistStore,
  type WatchlistItemType,
} from '@/lib/stores/watchlist-store';
import { filterCategories } from './constants';

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
