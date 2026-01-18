'use client';

import { searchClient as searchApi } from '@/api/client';
import { useDebounce } from '@/hooks';
import { cn, getSeriesRoute } from '@/lib/utils';
import type { Creator, Series, Video } from '@/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SearchDropdown } from './components/SearchDropdown';
import { SearchInput } from './components/SearchInput';

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
  if (globalThis.window === undefined) return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (globalThis.window === undefined || !query.trim()) return;
  try {
    const recent = getRecentSearches().filter((s) => s.query !== query);
    recent.unshift({ query, timestamp: Date.now() });
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT_SEARCHES)));
  } catch {
    // Ignore localStorage errors
  }
}

function removeRecentSearch(query: string) {
  if (globalThis.window === undefined) return;
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
        items.push({ type: 'series', data: s, href: getSeriesRoute(s.id, s.title) });
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
            if (!item) return;
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

  const hasResults = Boolean(
    results &&
      (results.videos.length > 0 ||
        results.shorts.length > 0 ||
        results.series.length > 0 ||
        results.creators.length > 0)
  );

  const showDropdown = !!(isOpen && (recentSearches.length > 0 || query.trim()));

  return (
    <div className={cn('relative', className)}>
      <SearchInput
        query={query}
        isLoading={isLoading}
        isFocused={isFocused}
        showDropdown={showDropdown}
        inputRef={inputRef}
        onChange={setQuery}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClear={handleClear}
        onSubmit={handleSubmit}
      />

      {/* Dropdown */}
      {showDropdown && (
        <div ref={dropdownRef}>
          <SearchDropdown
            query={query}
            isLoading={isLoading}
            hasResults={hasResults}
            results={results}
            recentSearches={recentSearches}
            selectedIndex={selectedIndex}
            onItemClick={handleItemClick}
            onRemoveRecent={handleRemoveRecent}
          />
        </div>
      )}
    </div>
  );
}
