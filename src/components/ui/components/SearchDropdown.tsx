/**
 * Search dropdown results component
 */

import { Spinner } from '@/components/ui/spinner';
import { cn, getCreatorRoute, getSeriesRoute } from '@/lib/utils';
import type { Creator, Series, Video } from '@/types';
import { ArrowUpRight, BookOpen, Clock, Film, Play, TrendingUp, Users, X } from 'lucide-react';
import Image from 'next/image';

interface RecentSearch {
  query: string;
  timestamp: number;
}

interface SearchResult {
  videos: Video[];
  shorts: Video[];
  series: Series[];
  creators: Creator[];
}

interface SearchDropdownProps {
  query: string;
  isLoading: boolean;
  hasResults: boolean;
  results: SearchResult | null;
  recentSearches: RecentSearch[];
  selectedIndex: number;
  onItemClick: (href: string, searchQuery?: string) => void;
  onRemoveRecent: (e: React.MouseEvent, searchQuery: string) => void;
}

export function SearchDropdown({
  query,
  isLoading,
  hasResults,
  results,
  recentSearches,
  selectedIndex,
  onItemClick,
  onRemoveRecent,
}: SearchDropdownProps) {
  let currentIndex = 0;

  return (
    <div className="absolute top-full left-0 right-0 bg-surface border border-t-0 border-border rounded-b-xl shadow-lg z-50 max-h-[70vh] overflow-y-auto">
      {!query.trim() && recentSearches.length > 0 && (
        <div className="p-2">
          <p className="px-3 py-2 text-xs font-medium text-text-secondary uppercase tracking-wider">
            Recent Searches
          </p>
          {recentSearches.map((search, index) => (
            <button
              key={search.query}
              onClick={() =>
                onItemClick(`/searches?q=${encodeURIComponent(search.query)}`, search.query)
              }
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                selectedIndex === index ? 'bg-hover' : 'hover:bg-hover'
              )}
            >
              <Clock className="w-4 h-4 text-text-secondary shrink-0" />
              <span className="flex-1 text-left text-sm text-text-primary truncate">
                {search.query}
              </span>
              <button
                onClick={(e) => onRemoveRecent(e, search.query)}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-surface rounded transition-all"
              >
                <X className="w-3.5 h-3.5 text-text-secondary" />
              </button>
            </button>
          ))}
        </div>
      )}

      {query.trim() && isLoading && (
        <div className="p-6 text-center">
          <Spinner size="md" />
          <p className="mt-2 text-sm text-text-secondary">Searching...</p>
        </div>
      )}

      {query.trim() && !isLoading && !hasResults && (
        <div className="p-6 text-center">
          <p className="text-sm text-text-secondary">No results found for &quot;{query}&quot;</p>
          <button
            onClick={() => onItemClick(`/searches?q=${encodeURIComponent(query)}`)}
            className="mt-2 text-sm text-red-primary hover:underline"
          >
            Search anyway
          </button>
        </div>
      )}

      {query.trim() && !isLoading && hasResults && results && (
        <div className="divide-y divide-border">
          {results.videos.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2">
                <Film className="w-4 h-4 text-text-secondary" />
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Videos
                </span>
              </div>
              {results.videos.slice(0, 3).map((video) => {
                const itemIndex = currentIndex++;
                return (
                  <button
                    key={video.uuid}
                    onClick={() => onItemClick(`/videos/${video.id}`)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      selectedIndex === itemIndex ? 'bg-hover' : 'hover:bg-hover'
                    )}
                  >
                    <div className="relative w-16 h-9 rounded overflow-hidden bg-black shrink-0">
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
                      <p className="text-xs text-text-secondary truncate">{video.channel?.name}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-text-secondary shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {results.shorts.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2">
                <Play className="w-4 h-4 text-text-secondary" />
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Shorts
                </span>
              </div>
              {results.shorts.slice(0, 2).map((short) => {
                const itemIndex = currentIndex++;
                return (
                  <button
                    key={short.uuid}
                    onClick={() => onItemClick(`/shorts/${short.uuid}`)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      selectedIndex === itemIndex ? 'bg-hover' : 'hover:bg-hover'
                    )}
                  >
                    <div className="relative w-9 h-16 rounded overflow-hidden bg-black shrink-0">
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
                    <ArrowUpRight className="w-4 h-4 text-text-secondary shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {results.series.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2">
                <BookOpen className="w-4 h-4 text-text-secondary" />
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Series
                </span>
              </div>
              {results.series.slice(0, 2).map((s) => {
                const itemIndex = currentIndex++;
                return (
                  <button
                    key={s.uuid}
                    onClick={() => onItemClick(getSeriesRoute(s.id, s.title))}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      selectedIndex === itemIndex ? 'bg-hover' : 'hover:bg-hover'
                    )}
                  >
                    <div className="relative w-16 h-9 rounded overflow-hidden bg-black shrink-0">
                      {s.thumbnail && (
                        <Image src={s.thumbnail} alt={s.title} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm text-text-primary truncate">{s.title}</p>
                      <p className="text-xs text-text-secondary">{s.videos_count} episodes</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-text-secondary shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {results.creators.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2">
                <Users className="w-4 h-4 text-text-secondary" />
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Creators
                </span>
              </div>
              {results.creators.slice(0, 2).map((creator) => {
                const itemIndex = currentIndex++;
                return (
                  <button
                    key={creator.uuid || creator.id}
                    onClick={() => onItemClick(getCreatorRoute(creator.handler))}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      selectedIndex === itemIndex ? 'bg-hover' : 'hover:bg-hover'
                    )}
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-surface shrink-0">
                      {creator.dp && (
                        <Image src={creator.dp} alt={creator.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm text-text-primary truncate">{creator.name}</p>
                      <p className="text-xs text-text-secondary">Creator</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-text-secondary shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          <div className="p-2">
            <button
              onClick={() => onItemClick(`/searches?q=${encodeURIComponent(query)}`)}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 text-sm text-red-primary hover:bg-hover rounded-lg transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              See all results for &quot;{query}&quot;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
