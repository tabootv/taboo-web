'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  X,
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

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 200);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build flat list of navigable items for keyboard navigation
  const getNavigableItems = useCallback(() => {
    const items: { type: string; data: unknown; href: string }[] = [];

    if (!query.trim()) {
      // Recent searches
      recentSearches.forEach((s) => {
        items.push({ type: 'recent', data: s, href: `/searches?q=${encodeURIComponent(s.query)}` });
      });
    } else if (results) {
      // Search results
      results.videos.slice(0, 3).forEach((v) => {
        items.push({ type: 'video', data: v, href: `/videos/${v.id}` });
      });
      results.shorts.slice(0, 2).forEach((s) => {
        items.push({ type: 'short', data: s, href: `/shorts/${s.uuid}` });
      });
      results.series.slice(0, 2).forEach((s) => {
        items.push({ type: 'series', data: s, href: `/series/${s.uuid}` });
      });
      results.creators.slice(0, 2).forEach((c) => {
        items.push({ type: 'creator', data: c, href: `/creators/creator-profile/${c.id}` });
      });
    }

    return items;
  }, [query, results, recentSearches]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = getNavigableItems();

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < items.length) {
            const item = items[selectedIndex];
            if (item.type === 'recent') {
              const recentItem = item.data as RecentSearch;
              setQuery(recentItem.query);
              saveRecentSearch(recentItem.query);
            } else {
              saveRecentSearch(query);
            }
            router.push(item.href);
            setIsOpen(false);
            inputRef.current?.blur();
          } else if (query.trim()) {
            saveRecentSearch(query);
            router.push(`/searches?q=${encodeURIComponent(query.trim())}`);
            setIsOpen(false);
            inputRef.current?.blur();
          }
          break;
        case 'Escape':
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [getNavigableItems, selectedIndex, query, router]
  );

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results, query]);

  const handleFocus = () => {
    setIsFocused(true);
    setIsOpen(true);
    setRecentSearches(getRecentSearches());
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

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
    setIsOpen(false);
    setQuery('');
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
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const hasResults =
    results &&
    (results.videos.length > 0 ||
      results.shorts.length > 0 ||
      results.series.length > 0 ||
      results.creators.length > 0);

  const showDropdown = isOpen && (recentSearches.length > 0 || query.trim());

  const navigableItems = getNavigableItems();

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            'flex items-center bg-surface border rounded-full overflow-hidden transition-all',
            isFocused ? 'border-red-primary ring-1 ring-red-primary/20' : 'border-border',
            showDropdown && 'rounded-b-none border-b-transparent'
          )}
        >
          <div className="pl-4 pr-2">
            <Search className="w-5 h-5 text-text-secondary" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Search"
            className="flex-1 py-2.5 bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
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
          <button
            type="submit"
            className="px-4 py-2.5 bg-hover border-l border-border hover:bg-surface-hover transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 bg-surface border border-t-0 border-border rounded-b-xl shadow-lg z-50 max-h-[70vh] overflow-y-auto"
        >
          {/* Recent Searches */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Recent Searches
              </p>
              {recentSearches.map((search, index) => (
                <button
                  key={search.query}
                  onClick={() => handleItemClick(`/searches?q=${encodeURIComponent(search.query)}`, search.query)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                    selectedIndex === index ? 'bg-hover' : 'hover:bg-hover'
                  )}
                >
                  <Clock className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  <span className="flex-1 text-left text-sm text-text-primary truncate">
                    {search.query}
                  </span>
                  <button
                    onClick={(e) => handleRemoveRecent(e, search.query)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-surface rounded transition-all"
                  >
                    <X className="w-3.5 h-3.5 text-text-secondary" />
                  </button>
                </button>
              ))}
            </div>
          )}

          {/* Loading state */}
          {query.trim() && isLoading && (
            <div className="p-6 text-center">
              <Spinner size="md" />
              <p className="mt-2 text-sm text-text-secondary">Searching...</p>
            </div>
          )}

          {/* No results */}
          {query.trim() && !isLoading && !hasResults && (
            <div className="p-6 text-center">
              <p className="text-sm text-text-secondary">
                No results found for &quot;{query}&quot;
              </p>
              <button
                onClick={() => handleItemClick(`/searches?q=${encodeURIComponent(query)}`)}
                className="mt-2 text-sm text-red-primary hover:underline"
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
                <div className="p-2">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Film className="w-4 h-4 text-text-secondary" />
                    <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Videos
                    </span>
                  </div>
                  {results.videos.slice(0, 3).map((video, vIndex) => {
                    const itemIndex = vIndex;
                    return (
                      <button
                        key={video.uuid}
                        onClick={() => handleItemClick(`/videos/${video.id}`)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                          selectedIndex === itemIndex ? 'bg-hover' : 'hover:bg-hover'
                        )}
                      >
                        <div className="relative w-16 h-9 rounded overflow-hidden bg-black flex-shrink-0">
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
                          <p className="text-sm text-text-primary truncate">{video.title}</p>
                          <p className="text-xs text-text-secondary truncate">
                            {video.channel?.name}
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-text-secondary flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Shorts */}
              {results.shorts.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Play className="w-4 h-4 text-text-secondary" />
                    <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Shorts
                    </span>
                  </div>
                  {results.shorts.slice(0, 2).map((short, sIndex) => {
                    const itemIndex = (results.videos.slice(0, 3).length) + sIndex;
                    return (
                      <button
                        key={short.uuid}
                        onClick={() => handleItemClick(`/shorts/${short.uuid}`)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                          selectedIndex === itemIndex ? 'bg-hover' : 'hover:bg-hover'
                        )}
                      >
                        <div className="relative w-9 h-16 rounded overflow-hidden bg-black flex-shrink-0">
                          {short.thumbnail && (
                            <Image
                              src={short.thumbnail_webp || short.thumbnail}
                              alt={short.title}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm text-text-primary truncate">{short.title}</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-text-secondary flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Series */}
              {results.series.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <BookOpen className="w-4 h-4 text-text-secondary" />
                    <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Series
                    </span>
                  </div>
                  {results.series.slice(0, 2).map((s, seriesIndex) => {
                    const itemIndex =
                      results.videos.slice(0, 3).length +
                      results.shorts.slice(0, 2).length +
                      seriesIndex;
                    return (
                      <button
                        key={s.uuid}
                        onClick={() => handleItemClick(`/series/${s.uuid}`)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                          selectedIndex === itemIndex ? 'bg-hover' : 'hover:bg-hover'
                        )}
                      >
                        <div className="relative w-16 h-9 rounded overflow-hidden bg-black flex-shrink-0">
                          {s.thumbnail && (
                            <Image src={s.thumbnail} alt={s.title} fill className="object-cover" />
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm text-text-primary truncate">{s.title}</p>
                          <p className="text-xs text-text-secondary">
                            {s.videos_count} episodes
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-text-secondary flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Creators */}
              {results.creators.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Users className="w-4 h-4 text-text-secondary" />
                    <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Creators
                    </span>
                  </div>
                  {results.creators.slice(0, 2).map((creator, cIndex) => {
                    const itemIndex =
                      results.videos.slice(0, 3).length +
                      results.shorts.slice(0, 2).length +
                      results.series.slice(0, 2).length +
                      cIndex;
                    return (
                      <button
                        key={creator.uuid || creator.id}
                        onClick={() => handleItemClick(`/creators/creator-profile/${creator.id}`)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                          selectedIndex === itemIndex ? 'bg-hover' : 'hover:bg-hover'
                        )}
                      >
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-surface flex-shrink-0">
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
                    );
                  })}
                </div>
              )}

              {/* See all results */}
              <div className="p-2">
                <button
                  onClick={() => handleItemClick(`/searches?q=${encodeURIComponent(query)}`)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-3 text-sm text-red-primary hover:bg-hover rounded-lg transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  See all results for &quot;{query}&quot;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
