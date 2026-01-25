/**
 * Search results list component
 */

import { Search, ArrowRight } from 'lucide-react';
import { cn } from '@/shared/utils/formatting';
import { SearchResultItem } from './SearchResultItem';
import type { Video, Series, Creator } from '@/types';

type ResultItem =
  | { type: 'video'; data: Video }
  | { type: 'short'; data: Video }
  | { type: 'series'; data: Series }
  | { type: 'creator'; data: Creator };

interface SearchResultsProps {
  results: {
    videos: Video[];
    shorts: Video[];
    series: Series[];
    creators: Creator[];
  };
  query: string;
  isLoading: boolean;
  selectedIndex: number;
  onItemClick: (item: ResultItem) => void;
  onViewAll: () => void;
}

export function SearchResults({
  results,
  query,
  isLoading,
  selectedIndex,
  onItemClick,
  onViewAll,
}: SearchResultsProps) {
  const hasResults =
    results.videos.length > 0 ||
    results.shorts.length > 0 ||
    results.series.length > 0 ||
    results.creators.length > 0;

  // Build flat list of all results for navigation
  const allResults: ResultItem[] = [];
  results.videos.slice(0, 3).forEach((v) => allResults.push({ type: 'video', data: v }));
  results.shorts.slice(0, 2).forEach((s) => allResults.push({ type: 'short', data: s }));
  results.series.slice(0, 2).forEach((s) => allResults.push({ type: 'series', data: s }));
  results.creators.slice(0, 2).forEach((c) => allResults.push({ type: 'creator', data: c }));

  // Loading skeleton
  if (isLoading && !hasResults) {
    return (
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
    );
  }

  // No results
  if (!isLoading && !hasResults) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary mb-4">
          No results found for &quot;{query}&quot;
        </p>
        <button
          onClick={onViewAll}
          className="px-4 py-2 bg-red-primary hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Search anyway
        </button>
      </div>
    );
  }

  // Results list
  if (!isLoading && hasResults) {
    let currentIndex = 0;

    return (
      <>
        {/* Videos */}
        {results.videos.slice(0, 3).map((video) => {
          const index = currentIndex++;
          return (
            <SearchResultItem
              key={`video-${video.uuid}`}
              item={{ type: 'video', data: video }}
              query={query}
              index={index}
              selectedIndex={selectedIndex}
              onClick={() => onItemClick({ type: 'video', data: video })}
            />
          );
        })}

        {/* Shorts */}
        {results.shorts.slice(0, 2).map((short) => {
          const index = currentIndex++;
          return (
            <SearchResultItem
              key={`short-${short.uuid}`}
              item={{ type: 'short', data: short }}
              query={query}
              index={index}
              selectedIndex={selectedIndex}
              onClick={() => onItemClick({ type: 'short', data: short })}
            />
          );
        })}

        {/* Series */}
        {results.series.slice(0, 2).map((series) => {
          const index = currentIndex++;
          return (
            <SearchResultItem
              key={`series-${series.uuid}`}
              item={{ type: 'series', data: series }}
              query={query}
              index={index}
              selectedIndex={selectedIndex}
              onClick={() => onItemClick({ type: 'series', data: series })}
            />
          );
        })}

        {/* Creators */}
        {results.creators.slice(0, 2).map((creator) => {
          const index = currentIndex++;
          return (
            <SearchResultItem
              key={`creator-${creator.id}`}
              item={{ type: 'creator', data: creator }}
              query={query}
              index={index}
              selectedIndex={selectedIndex}
              onClick={() => onItemClick({ type: 'creator', data: creator })}
            />
          );
        })}

        {/* View all results */}
        <button
          onClick={onViewAll}
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
    );
  }

  return null;
}

