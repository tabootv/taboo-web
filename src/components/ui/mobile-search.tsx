'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { search as searchApi } from '@/lib/api';
import { useDebounce } from '@/lib/hooks';
import type { Video, Series, Creator } from '@/types';
import { Spinner } from './spinner';
import { MobileSearchHeader } from './components/MobileSearchHeader';
import { MobileRecentSearches } from './components/MobileRecentSearches';
import { MobileSearchResults } from './components/MobileSearchResults';
import { useMobileRecentSearches } from './hooks/use-mobile-recent-searches';

interface SearchResult {
  videos: Video[];
  shorts: Video[];
  series: Series[];
  creators: Creator[];
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
  const { recentSearches, saveRecentSearch, removeRecentSearch } = useMobileRecentSearches();

  const debouncedQuery = useDebounce(query, 200);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
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

  const handleItemClick = useCallback((href: string, searchQuery?: string) => {
    if (searchQuery) {
      saveRecentSearch(searchQuery);
    } else if (query.trim()) {
      saveRecentSearch(query);
    }
    router.push(href);
    onClose();
  }, [query, saveRecentSearch, router, onClose]);

  const handleRemoveRecent = useCallback((e: React.MouseEvent, searchQuery: string) => {
    e.stopPropagation();
    e.preventDefault();
    removeRecentSearch(searchQuery);
  }, [removeRecentSearch]);

  const handleRecentSearchClick = useCallback((searchQuery: string) => {
    handleItemClick(`/searches?q=${encodeURIComponent(searchQuery)}`, searchQuery);
  }, [handleItemClick]);

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
      <MobileSearchHeader
        query={query}
        isLoading={isLoading}
        inputRef={inputRef}
        onQueryChange={setQuery}
        onClear={handleClear}
        onSubmit={handleSubmit}
        onClose={onClose}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Recent Searches */}
        {!query.trim() && (
          <MobileRecentSearches
            recentSearches={recentSearches}
            onItemClick={handleRecentSearchClick}
            onRemove={handleRemoveRecent}
          />
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
        {query.trim() && !isLoading && hasResults && results && (
          <MobileSearchResults
            results={results}
            query={query}
            onItemClick={handleItemClick}
          />
        )}
      </div>
    </div>
  );
}
