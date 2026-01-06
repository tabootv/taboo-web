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
import {
  Search,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks';
import { searchClient as searchApi } from '@/api/client';
import type { Video, Series, Creator } from '@/types';
import { useRecentSearches } from './hooks/use-recent-searches';
import { RecentSearches } from './components/RecentSearches';
import { SearchResults } from './components/SearchResults';
import { TopResultPreview } from './components/TopResultPreview';

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

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<{
      videos: Video[];
      shorts: Video[];
      series: Series[];
      creators: Creator[];
    } | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [error, setError] = useState<string | null>(null);

    const { recentSearches, addRecentSearch, removeSearch } = useRecentSearches();
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
              if (selected) {
                setQuery(selected);
                handleViewAll(selected);
              }
            } else if (query.trim()) {
              if (selectedIndex === allResults.length) {
                // "View all" selected
                handleViewAll();
              } else if (selectedIndex >= 0 && selectedIndex < allResults.length) {
                const item = allResults[selectedIndex];
                if (item) {
                  handleItemClick(item);
                }
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
        addRecentSearch(q.trim());
        router.push(`/searches?q=${encodeURIComponent(q.trim())}`);
        setIsOpen(false);
        setQuery('');
      }
    };

    const handleItemClick = (item: ResultItem) => {
      addRecentSearch(query.trim());
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
      removeSearch(searchQuery);
    };

    const handleClose = () => {
      setIsOpen(false);
      setQuery('');
      setResults(null);
    };

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
                      {recentSearches.length > 0 ? (
                        <RecentSearches
                          searches={recentSearches}
                          selectedIndex={selectedIndex}
                          onSearchClick={handleRecentClick}
                          onRemove={handleRemoveRecent}
                        />
                      ) : (
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
                  {query.trim() && results && (
                    <div className="space-y-1">
                      <SearchResults
                        results={results}
                        query={query}
                        isLoading={isLoading}
                        selectedIndex={selectedIndex}
                        onItemClick={handleItemClick}
                        onViewAll={handleViewAll}
                      />
                    </div>
                  )}
                </div>

                {/* Right column: Top result preview (desktop only) */}
                {query.trim() && topResult && !isLoading && (
                  <TopResultPreview result={topResult} onClose={handleClose} />
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
