'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Play,
  Film,
  Users,
  BookOpen,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks';
import { search as searchApi } from '@/lib/api';
import { highlightMatch } from '@/lib/utils/highlightMatch';
import { formatCompactNumber, formatDuration } from '@/lib/utils';
import type { Video, Series, Creator } from '@/types';

const MAX_RECENT_SEARCHES = 8;
const RECENT_SEARCHES_KEY = 'tabootv-search-history';

// Recent searches helpers
function getRecentSearches(): string[] {
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
    const recent = getRecentSearches().filter((s) => s !== query);
    recent.unshift(query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT_SEARCHES)));
  } catch {
    // Ignore localStorage errors
  }
}

function removeRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentSearches().filter((s) => s !== query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
  } catch {
    // Ignore localStorage errors
  }
}

// Result item types for unified handling
type ResultItem =
  | { type: 'video'; data: Video }
  | { type: 'short'; data: Video }
  | { type: 'series'; data: Series }
  | { type: 'creator'; data: Creator };

export interface GlobalSearchHandle {
  open: () => void;
  close: () => void;
}

interface GlobalSearchNetflixProps {
  className?: string;
}

export const GlobalSearchNetflix = forwardRef<GlobalSearchHandle, GlobalSearchNetflixProps>(
  function GlobalSearchNetflix({ className }, ref) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<{
      videos: Video[];
      shorts: Video[];
      series: Series[];
      creators: Creator[];
    } | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [error, setError] = useState<string | null>(null);

    const debouncedQuery = useDebounce(query, 200);

    // Expose open/close methods
    useImperativeHandle(ref, () => ({
      open: () => {
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      },
      close: () => {
        setIsOpen(false);
        setQuery('');
        setResults(null);
      },
    }));

    // Load recent searches on mount/open
    useEffect(() => {
      if (isOpen) {
        setRecentSearches(getRecentSearches());
      }
    }, [isOpen]);

    // Fetch suggestions using real API
    useEffect(() => {
      if (!debouncedQuery.trim()) {
        setResults(null);
        setIsLoading(false);
        return;
      }

      const fetchSuggestions = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const data = await searchApi.search(debouncedQuery);
          setResults({
            videos: data.videos || [],
            shorts: data.shorts || [],
            series: data.series || [],
            creators: data.creators || [],
          });
        } catch (err) {
          console.error('Search failed:', err);
          setError('Search failed. Please try again.');
          setResults(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSuggestions();
    }, [debouncedQuery]);

    // Build flat list of all results for navigation
    const getAllResults = useCallback((): ResultItem[] => {
      if (!results) return [];
      const items: ResultItem[] = [];

      results.videos.slice(0, 3).forEach((v) => items.push({ type: 'video', data: v }));
      results.shorts.slice(0, 2).forEach((s) => items.push({ type: 'short', data: s }));
      results.series.slice(0, 2).forEach((s) => items.push({ type: 'series', data: s }));
      results.creators.slice(0, 2).forEach((c) => items.push({ type: 'creator', data: c }));

      return items;
    }, [results]);

    // Keyboard handling
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Cmd/Ctrl + K to open
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }

        // Escape to close
        if (e.key === 'Escape' && isOpen) {
          e.preventDefault();
          setIsOpen(false);
          setQuery('');
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Keyboard navigation in suggestions
    const handleInputKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        const allResults = getAllResults();
        const recentItems = query.trim() ? [] : recentSearches;
        const totalItems = query.trim() ? allResults.length + 1 : recentItems.length; // +1 for "View all"

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
            break;
          case 'Enter':
            e.preventDefault();
            if (!query.trim() && selectedIndex >= 0 && selectedIndex < recentItems.length) {
              // Recent search selected
              const selected = recentItems[selectedIndex];
              setQuery(selected);
              handleViewAll(selected);
            } else if (query.trim()) {
              if (selectedIndex === allResults.length) {
                // "View all" selected
                handleViewAll();
              } else if (selectedIndex >= 0 && selectedIndex < allResults.length) {
                const item = allResults[selectedIndex];
                handleItemClick(item);
              } else {
                handleViewAll();
              }
            }
            break;
        }
      },
      [getAllResults, recentSearches, selectedIndex, query]
    );

    // Reset selected index when query changes
    useEffect(() => {
      setSelectedIndex(-1);
    }, [query]);

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

    const handleViewAll = (searchQuery?: string) => {
      const q = searchQuery || query;
      if (q.trim()) {
        saveRecentSearch(q.trim());
        router.push(`/searches?q=${encodeURIComponent(q.trim())}`);
        setIsOpen(false);
        setQuery('');
      }
    };

    const handleItemClick = (item: ResultItem) => {
      saveRecentSearch(query.trim());
      let href = '';

      switch (item.type) {
        case 'video':
          href = `/videos/${item.data.id}`;
          break;
        case 'short':
          href = `/shorts/${item.data.uuid}`;
          break;
        case 'series':
          href = `/series/${item.data.uuid}`;
          break;
        case 'creator':
          href = `/creators/creator-profile/${item.data.id}`;
          break;
      }

      if (href) {
        router.push(href);
        setIsOpen(false);
        setQuery('');
      }
    };

    const handleRecentClick = (searchQuery: string) => {
      setQuery(searchQuery);
      handleViewAll(searchQuery);
    };

    const handleRemoveRecent = (e: React.MouseEvent, searchQuery: string) => {
      e.stopPropagation();
      removeRecentSearch(searchQuery);
      setRecentSearches(getRecentSearches());
    };

    const handleClose = () => {
      setIsOpen(false);
      setQuery('');
      setResults(null);
    };

    const hasResults =
      results &&
      (results.videos.length > 0 ||
        results.shorts.length > 0 ||
        results.series.length > 0 ||
        results.creators.length > 0);

    const allResults = getAllResults();
    const topResult = results?.videos[0] || results?.series[0];

    return (
      <>
        {/* Search trigger button */}
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 bg-surface/50 hover:bg-surface border border-border rounded-full transition-colors group',
            className
          )}
        >
          <Search className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors hidden sm:inline">
            Search
          </span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-text-secondary bg-background/50 rounded border border-border">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        {/* Overlay */}
        {isOpen && (
          <div
            ref={overlayRef}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === overlayRef.current) handleClose();
            }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-surface/50 hover:bg-surface text-text-secondary hover:text-text-primary transition-colors z-10"
              aria-label="Close search"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Search container */}
            <div className="w-full max-w-5xl mx-auto px-4 pt-20 pb-10 h-full overflow-y-auto">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left column: Search input and results */}
                <div className="flex-1 min-w-0">
                  {/* Search input */}
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-text-secondary" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      placeholder="Search for videos, series, creators..."
                      className="w-full pl-14 pr-14 py-4 bg-surface/80 backdrop-blur border border-border focus:border-red-primary rounded-xl text-lg text-text-primary placeholder:text-text-secondary outline-none transition-colors"
                      autoFocus
                    />
                    {isLoading && (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary animate-spin" />
                    )}
                    {query && !isLoading && (
                      <button
                        onClick={() => setQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-hover rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-text-secondary" />
                      </button>
                    )}
                  </div>

                  {/* Error state */}
                  {error && (
                    <div className="p-4 bg-red-primary/10 border border-red-primary/20 rounded-lg text-red-400 mb-6">
                      {error}
                    </div>
                  )}

                  {/* No query: Recent searches */}
                  {!query.trim() && (
                    <div className="space-y-8">
                      {/* Recent searches */}
                      {recentSearches.length > 0 && (
                        <div>
                          <h3 className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-3">
                            <Clock className="w-4 h-4" />
                            Recent Searches
                          </h3>
                          <div className="space-y-1">
                            {recentSearches.map((search, index) => (
                              <button
                                key={search}
                                onClick={() => handleRecentClick(search)}
                                className={cn(
                                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group',
                                  selectedIndex === index ? 'bg-surface' : 'hover:bg-surface/50'
                                )}
                              >
                                <Clock className="w-4 h-4 text-text-secondary flex-shrink-0" />
                                <span className="flex-1 text-left text-text-primary">{search}</span>
                                <button
                                  onClick={(e) => handleRemoveRecent(e, search)}
                                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-hover rounded transition-all"
                                >
                                  <X className="w-4 h-4 text-text-secondary" />
                                </button>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Empty state */}
                      {recentSearches.length === 0 && (
                        <div className="text-center py-12">
                          <Search className="w-12 h-12 mx-auto text-text-secondary opacity-50 mb-4" />
                          <p className="text-text-secondary">
                            Search for videos, series, and creators
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Search results */}
                  {query.trim() && (
                    <div className="space-y-1">
                      {/* Loading skeleton */}
                      {isLoading && !hasResults && (
                        <div className="space-y-2">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-4 px-4 py-3 rounded-lg bg-surface/30 animate-pulse"
                            >
                              <div className="w-16 h-10 rounded bg-surface" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 bg-surface rounded" />
                                <div className="h-3 w-1/2 bg-surface rounded" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Results list */}
                      {!isLoading && hasResults && (
                        <>
                          {/* Videos */}
                          {results.videos.slice(0, 3).map((video, index) => (
                            <button
                              key={`video-${video.uuid}`}
                              onClick={() => handleItemClick({ type: 'video', data: video })}
                              className={cn(
                                'w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors',
                                selectedIndex === index ? 'bg-surface' : 'hover:bg-surface/50'
                              )}
                            >
                              <div className="relative w-16 h-10 rounded overflow-hidden bg-black flex-shrink-0">
                                {(video.thumbnail || video.thumbnail_webp) && (
                                  <Image
                                    src={video.thumbnail_webp || video.thumbnail || ''}
                                    alt={video.title}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <p className="text-text-primary truncate">
                                  {highlightMatch(video.title, query)}
                                </p>
                                <p className="text-sm text-text-secondary truncate">
                                  {video.channel?.name}
                                </p>
                              </div>
                              <Film className="w-4 h-4 text-text-secondary flex-shrink-0" />
                            </button>
                          ))}

                          {/* Shorts */}
                          {results.shorts.slice(0, 2).map((short, idx) => {
                            const index = results.videos.slice(0, 3).length + idx;
                            return (
                              <button
                                key={`short-${short.uuid}`}
                                onClick={() => handleItemClick({ type: 'short', data: short })}
                                className={cn(
                                  'w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors',
                                  selectedIndex === index ? 'bg-surface' : 'hover:bg-surface/50'
                                )}
                              >
                                <div className="relative w-8 h-14 rounded overflow-hidden bg-black flex-shrink-0">
                                  {(short.thumbnail || short.thumbnail_webp) && (
                                    <Image
                                      src={short.thumbnail_webp || short.thumbnail || ''}
                                      alt={short.title}
                                      fill
                                      className="object-cover"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <p className="text-text-primary truncate">
                                    {highlightMatch(short.title, query)}
                                  </p>
                                  <p className="text-sm text-text-secondary">Short</p>
                                </div>
                                <Play className="w-4 h-4 text-text-secondary flex-shrink-0" />
                              </button>
                            );
                          })}

                          {/* Series */}
                          {results.series.slice(0, 2).map((series, idx) => {
                            const index =
                              results.videos.slice(0, 3).length +
                              results.shorts.slice(0, 2).length +
                              idx;
                            return (
                              <button
                                key={`series-${series.uuid}`}
                                onClick={() => handleItemClick({ type: 'series', data: series })}
                                className={cn(
                                  'w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors',
                                  selectedIndex === index ? 'bg-surface' : 'hover:bg-surface/50'
                                )}
                              >
                                <div className="relative w-16 h-10 rounded overflow-hidden bg-black flex-shrink-0">
                                  {series.thumbnail && (
                                    <Image
                                      src={series.thumbnail}
                                      alt={series.title}
                                      fill
                                      className="object-cover"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <p className="text-text-primary truncate">
                                    {highlightMatch(series.title, query)}
                                  </p>
                                  <p className="text-sm text-text-secondary">
                                    {series.videos_count} episodes
                                  </p>
                                </div>
                                <BookOpen className="w-4 h-4 text-text-secondary flex-shrink-0" />
                              </button>
                            );
                          })}

                          {/* Creators */}
                          {results.creators.slice(0, 2).map((creator, idx) => {
                            const index =
                              results.videos.slice(0, 3).length +
                              results.shorts.slice(0, 2).length +
                              results.series.slice(0, 2).length +
                              idx;
                            return (
                              <button
                                key={`creator-${creator.id}`}
                                onClick={() => handleItemClick({ type: 'creator', data: creator })}
                                className={cn(
                                  'w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors',
                                  selectedIndex === index ? 'bg-surface' : 'hover:bg-surface/50'
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
                                  <p className="text-text-primary truncate">
                                    {highlightMatch(creator.name, query)}
                                  </p>
                                  <p className="text-sm text-text-secondary">
                                    {formatCompactNumber(creator.subscribers_count ?? 0)} subscribers
                                  </p>
                                </div>
                                <Users className="w-4 h-4 text-text-secondary flex-shrink-0" />
                              </button>
                            );
                          })}

                          {/* View all results */}
                          <button
                            onClick={() => handleViewAll()}
                            className={cn(
                              'w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors mt-2',
                              selectedIndex === allResults.length
                                ? 'bg-red-primary text-white'
                                : 'bg-surface/50 hover:bg-surface text-text-primary'
                            )}
                          >
                            <span className="flex items-center gap-2">
                              <Search className="w-4 h-4" />
                              View all results for &quot;{query}&quot;
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* No results */}
                      {!isLoading && !hasResults && query.trim() && (
                        <div className="text-center py-8">
                          <p className="text-text-secondary mb-4">
                            No results found for &quot;{query}&quot;
                          </p>
                          <button
                            onClick={() => handleViewAll()}
                            className="px-4 py-2 bg-red-primary hover:bg-red-600 text-white rounded-lg transition-colors"
                          >
                            Search anyway
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right column: Top result preview (desktop only) */}
                {query.trim() && topResult && !isLoading && (
                  <div className="hidden lg:block w-80 flex-shrink-0">
                    <h3 className="text-sm font-medium text-text-secondary mb-3">Top Result</h3>
                    <Link
                      href={
                        'videos_count' in topResult
                          ? `/series/${topResult.uuid}`
                          : `/videos/${topResult.id}`
                      }
                      onClick={handleClose}
                      className="block group"
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-surface">
                        <Image
                          src={
                            ('thumbnail_webp' in topResult && topResult.thumbnail_webp) ||
                            topResult.thumbnail ||
                            ''
                          }
                          alt={topResult.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                        {/* Play button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="w-8 h-8 text-black fill-black ml-1" />
                          </div>
                        </div>

                        {/* Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-white text-lg line-clamp-2">
                            {topResult.title}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                            {'channel' in topResult && topResult.channel?.name && (
                              <span>{topResult.channel.name}</span>
                            )}
                            {'videos_count' in topResult && (
                              <span>{topResult.videos_count} episodes</span>
                            )}
                            {'duration' in topResult && topResult.duration && (
                              <span>{formatDuration(topResult.duration)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {'description' in topResult && topResult.description && (
                        <p className="text-sm text-text-secondary mt-3 line-clamp-2">
                          {topResult.description}
                        </p>
                      )}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

export default GlobalSearchNetflix;
