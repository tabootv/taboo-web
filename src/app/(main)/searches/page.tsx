'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search as SearchIcon, X, Film, Play, Users, BookOpen } from 'lucide-react';
import { searchClient as searchApi } from '@/api/client';
import type { Video, Series, Creator } from '@/types';
import { Spinner } from '@/components/ui';
import { formatCompactNumber, formatDuration } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks';

type SearchTab = 'all' | 'videos' | 'shorts' | 'series' | 'creators';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{
    videos: Video[];
    shorts: Video[];
    series: Series[];
    creators: Creator[];
  }>({
    videos: [],
    shorts: [],
    series: [],
    creators: [],
  });

  const debouncedQuery = useDebounce(query, 300);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ videos: [], shorts: [], series: [], creators: [] });
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchApi.search(searchQuery);
      setResults({
        videos: data.videos || [],
        shorts: data.shorts || [],
        series: data.series || [],
        creators: data.creators || [],
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
      // Update URL without navigation
      const url = new URL(window.location.href);
      url.searchParams.set('q', debouncedQuery);
      window.history.replaceState({}, '', url.toString());
    }
  }, [debouncedQuery, performSearch]);

  const clearSearch = () => {
    setQuery('');
    setResults({ videos: [], shorts: [], series: [], creators: [] });
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    window.history.replaceState({}, '', url.toString());
  };

  const tabs = [
    { id: 'all' as SearchTab, label: 'All' },
    { id: 'videos' as SearchTab, label: 'Videos', icon: Film, count: results.videos.length },
    { id: 'shorts' as SearchTab, label: 'Shorts', icon: Play, count: results.shorts.length },
    { id: 'series' as SearchTab, label: 'Series', icon: BookOpen, count: results.series.length },
    { id: 'creators' as SearchTab, label: 'Creators', icon: Users, count: results.creators.length },
  ];

  const hasResults =
    results.videos.length > 0 ||
    results.shorts.length > 0 ||
    results.series.length > 0 ||
    results.creators.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 min-h-screen">
      {/* Search Input */}
      <div className="relative max-w-2xl mx-auto mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos, shorts, series, creators..."
            className="w-full pl-12 pr-12 py-4 bg-surface border border-border focus:border-red-primary rounded-xl text-lg outline-none transition-colors text-text-primary"
            autoFocus
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-hover rounded-full"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          )}
        </div>
        {isSearching && (
          <div className="absolute right-14 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      {/* Tabs */}
      {hasResults && (
        <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-red-primary text-white'
                  : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-red-primary/50'
              }`}
            >
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {!query && !hasResults && (
        <div className="text-center py-20">
          <SearchIcon className="w-16 h-16 mx-auto text-text-secondary mb-4" />
          <h2 className="text-xl font-medium text-text-primary mb-2">
            Search TabooTV
          </h2>
          <p className="text-text-secondary">
            Find videos, shorts, series, and creators
          </p>
        </div>
      )}

      {query && !hasResults && !isSearching && (
        <div className="text-center py-20">
          <p className="text-text-secondary">
            No results found for &quot;{query}&quot;
          </p>
        </div>
      )}

      {hasResults && (
        <div className="space-y-8">
          {/* Videos */}
          {(activeTab === 'all' || activeTab === 'videos') && results.videos.length > 0 && (
            <section>
              {activeTab === 'all' && (
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text-primary">Videos</h2>
                  <button
                    onClick={() => setActiveTab('videos')}
                    className="text-sm text-red-primary hover:underline"
                  >
                    See all
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(activeTab === 'all' ? results.videos.slice(0, 4) : results.videos).map(
                  (video) => (
                    <VideoCard key={video.uuid} video={video} />
                  )
                )}
              </div>
            </section>
          )}

          {/* Shorts */}
          {(activeTab === 'all' || activeTab === 'shorts') && results.shorts.length > 0 && (
            <section>
              {activeTab === 'all' && (
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text-primary">Shorts</h2>
                  <button
                    onClick={() => setActiveTab('shorts')}
                    className="text-sm text-red-primary hover:underline"
                  >
                    See all
                  </button>
                </div>
              )}
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {(activeTab === 'all' ? results.shorts.slice(0, 6) : results.shorts).map(
                  (short) => (
                    <ShortCard key={short.uuid} video={short} />
                  )
                )}
              </div>
            </section>
          )}

          {/* Series */}
          {(activeTab === 'all' || activeTab === 'series') && results.series.length > 0 && (
            <section>
              {activeTab === 'all' && (
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text-primary">Series</h2>
                  <button
                    onClick={() => setActiveTab('series')}
                    className="text-sm text-red-primary hover:underline"
                  >
                    See all
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(activeTab === 'all' ? results.series.slice(0, 3) : results.series).map(
                  (s) => (
                    <SeriesCard key={s.uuid} series={s} />
                  )
                )}
              </div>
            </section>
          )}

          {/* Creators */}
          {(activeTab === 'all' || activeTab === 'creators') && results.creators.length > 0 && (
            <section>
              {activeTab === 'all' && (
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text-primary">Creators</h2>
                  <button
                    onClick={() => setActiveTab('creators')}
                    className="text-sm text-red-primary hover:underline"
                  >
                    See all
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {(activeTab === 'all' ? results.creators.slice(0, 6) : results.creators).map(
                  (creator) => (
                    <CreatorCard key={creator.uuid || creator.id} creator={creator} />
                  )
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function VideoCard({ video }: { video: Video }) {
  return (
    <Link href={`/videos/${video.id}`} className="group">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface">
        {video.thumbnail && (
          <Image
            src={video.thumbnail_webp || video.thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {video.duration && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-xs rounded">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>
      <div className="mt-2">
        <h3 className="font-medium text-text-primary line-clamp-2 group-hover:text-red-primary transition-colors">
          {video.title}
        </h3>
        <p className="text-sm text-text-secondary mt-1">{video.channel?.name}</p>
        <p className="text-xs text-text-secondary">
          {formatCompactNumber(video.views_count ?? 0)} views
        </p>
      </div>
    </Link>
  );
}

function ShortCard({ video }: { video: Video }) {
  return (
    <Link href={`/shorts/${video.uuid}`} className="group flex-shrink-0 w-36">
      <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-surface">
        {video.thumbnail && (
          <Image
            src={video.thumbnail_webp || video.thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>
      <p className="mt-2 text-sm text-text-primary line-clamp-2">{video.title}</p>
    </Link>
  );
}

function SeriesCard({ series }: { series: Series }) {
  return (
    <Link href={`/series/${series.uuid}`} className="group">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface">
        {series.thumbnail && (
          <Image
            src={series.thumbnail}
            alt={series.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-bold text-white">{series.title}</h3>
          <p className="text-sm text-gray-300">{series.videos_count} episodes</p>
        </div>
      </div>
    </Link>
  );
}

function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <Link
      href={`/creators/creator-profile/${creator.id}`}
      className="flex flex-col items-center p-4 bg-surface border border-border rounded-xl hover:border-red-primary/50 transition-all"
    >
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-surface mb-3">
        {creator.dp && (
          <Image src={creator.dp} alt={creator.name} fill className="object-cover" />
        )}
      </div>
      <h3 className="font-medium text-text-primary text-center line-clamp-1">
        {creator.name}
      </h3>
      <p className="text-xs text-text-secondary">
        {formatCompactNumber(creator.subscribers_count ?? 0)} subscribers
      </p>
    </Link>
  );
}

export default function SearchesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner size="lg" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
