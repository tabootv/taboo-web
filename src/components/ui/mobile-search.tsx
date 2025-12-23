'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  X,
  ArrowLeft,
  Film,
  Play,
  BookOpen,
  Users,
  Clock,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { search as searchApi } from '@/lib/api';
import { useDebounce } from '@/lib/hooks';
import type { Video, Series, Creator } from '@/types';
import { Spinner } from './spinner';

interface SearchResult {
  videos: Video[];
  shorts: Video[];
  series: Series[];
  creators: Creator[];
}

interface RecentSearch {
  query: string;
  timestamp: number;
}

const MAX_RECENT_SEARCHES = 5;
const RECENT_SEARCHES_KEY = 'tabootv-recent-searches';

function getRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    const recent = getRecentSearches().filter((s) => s.query !== query);
    recent.unshift({ query, timestamp: Date.now() });
    localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(recent.slice(0, MAX_RECENT_SEARCHES))
    );
  } catch {
    // Ignore localStorage errors
  }
}

function removeRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentSearches().filter((s) => s.query !== query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
  } catch {
    // Ignore localStorage errors
  }
}

interface MobileSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearch({ isOpen, onClose }: MobileSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  const debouncedQuery = useDebounce(query, 200);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  // Fetch search results
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const data = await searchApi.search(debouncedQuery);
        setResults({
          videos: data.videos || [],
          shorts: data.shorts || [],
          series: data.series || [],
          creators: data.creators || [],
        });
      } catch (error) {
        console.error('Search failed:', error);
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClear = () => {
    setQuery('');
    setResults(null);
    inputRef.current?.focus();
  };

  const handleItemClick = (href: string, searchQuery?: string) => {
    if (searchQuery) {
      saveRecentSearch(searchQuery);
    } else if (query.trim()) {
      saveRecentSearch(query);
    }
    router.push(href);
    onClose();
  };

  const handleRemoveRecent = (e: React.MouseEvent, searchQuery: string) => {
    e.stopPropagation();
    e.preventDefault();
    removeRecentSearch(searchQuery);
    setRecentSearches(getRecentSearches());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query);
      router.push(`/searches?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const hasResults =
    results &&
    (results.videos.length > 0 ||
      results.shorts.length > 0 ||
      results.series.length > 0 ||
      results.creators.length > 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 px-2 h-14 border-b border-border">
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-hover text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="flex-1">
          <div className="flex items-center bg-surface border border-border rounded-full">
            <div className="pl-4">
              <Search className="w-5 h-5 text-text-secondary" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search TabooTV"
              className="flex-1 px-3 py-2.5 bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
            />
            {isLoading && (
              <div className="pr-2">
                <Spinner size="sm" />
              </div>
            )}
            {query && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Recent Searches */}
        {!query.trim() && recentSearches.length > 0 && (
          <div className="p-4">
            <p className="px-2 py-2 text-xs font-medium text-text-secondary uppercase tracking-wider">
              Recent Searches
            </p>
            {recentSearches.map((search) => (
              <button
                key={search.query}
                onClick={() =>
                  handleItemClick(
                    `/searches?q=${encodeURIComponent(search.query)}`,
                    search.query
                  )
                }
                className="w-full flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-hover transition-colors group"
              >
                <Clock className="w-5 h-5 text-text-secondary flex-shrink-0" />
                <span className="flex-1 text-left text-text-primary truncate">
                  {search.query}
                </span>
                <button
                  onClick={(e) => handleRemoveRecent(e, search.query)}
                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-surface rounded-full transition-all"
                >
                  <X className="w-4 h-4 text-text-secondary" />
                </button>
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!query.trim() && recentSearches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm">Search for videos, shorts, series, and creators</p>
          </div>
        )}

        {/* Loading state */}
        {query.trim() && isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" />
            <p className="mt-4 text-sm text-text-secondary">Searching...</p>
          </div>
        )}

        {/* No results */}
        {query.trim() && !isLoading && !hasResults && (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
            <p className="text-sm">No results found for &quot;{query}&quot;</p>
            <button
              onClick={() => handleItemClick(`/searches?q=${encodeURIComponent(query)}`)}
              className="mt-4 text-sm text-red-primary hover:underline"
            >
              Search anyway
            </button>
          </div>
        )}

        {/* Search Results */}
        {query.trim() && !isLoading && hasResults && (
          <div className="divide-y divide-border">
            {/* Videos */}
            {results.videos.length > 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 px-2 py-2">
                  <Film className="w-4 h-4 text-text-secondary" />
                  <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Videos
                  </span>
                </div>
                {results.videos.slice(0, 4).map((video) => (
                  <button
                    key={video.uuid}
                    onClick={() => handleItemClick(`/videos/${video.id}`)}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-hover transition-colors"
                  >
                    <div className="relative w-20 h-12 rounded overflow-hidden bg-black flex-shrink-0">
                      {video.thumbnail && (
                        <Image
                          src={video.thumbnail_webp || video.thumbnail}
                          alt={video.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm text-text-primary line-clamp-2">{video.title}</p>
                      <p className="text-xs text-text-secondary truncate mt-0.5">
                        {video.channel?.name}
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* Shorts */}
            {results.shorts.length > 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 px-2 py-2">
                  <Play className="w-4 h-4 text-text-secondary" />
                  <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Shorts
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                  {results.shorts.slice(0, 4).map((short) => (
                    <button
                      key={short.uuid}
                      onClick={() => handleItemClick(`/shorts/${short.uuid}`)}
                      className="flex-shrink-0 w-24"
                    >
                      <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-black">
                        {short.thumbnail && (
                          <Image
                            src={short.thumbnail_webp || short.thumbnail}
                            alt={short.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <p className="text-xs text-text-primary line-clamp-2 mt-1.5 text-left">
                        {short.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Series */}
            {results.series.length > 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 px-2 py-2">
                  <BookOpen className="w-4 h-4 text-text-secondary" />
                  <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Series
                  </span>
                </div>
                {results.series.slice(0, 3).map((s) => (
                  <button
                    key={s.uuid}
                    onClick={() => handleItemClick(`/series/${s.uuid}`)}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-hover transition-colors"
                  >
                    <div className="relative w-20 h-12 rounded overflow-hidden bg-black flex-shrink-0">
                      {s.thumbnail && (
                        <Image src={s.thumbnail} alt={s.title} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm text-text-primary truncate">{s.title}</p>
                      <p className="text-xs text-text-secondary">{s.videos_count} episodes</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* Creators */}
            {results.creators.length > 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 px-2 py-2">
                  <Users className="w-4 h-4 text-text-secondary" />
                  <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Creators
                  </span>
                </div>
                {results.creators.slice(0, 3).map((creator) => (
                  <button
                    key={creator.uuid || creator.id}
                    onClick={() => handleItemClick(`/creators/creator-profile/${creator.id}`)}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-hover transition-colors"
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-surface flex-shrink-0">
                      {creator.dp && (
                        <Image
                          src={creator.dp}
                          alt={creator.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm text-text-primary truncate">{creator.name}</p>
                      <p className="text-xs text-text-secondary">Creator</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* See all results */}
            <div className="p-4">
              <button
                onClick={() => handleItemClick(`/searches?q=${encodeURIComponent(query)}`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-primary bg-red-primary/10 hover:bg-red-primary/20 rounded-lg transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                See all results for &quot;{query}&quot;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
