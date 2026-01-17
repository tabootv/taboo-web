/**
 * Search results display component for mobile search
 */

import Image from 'next/image';
import { Film, Play, BookOpen, Users, ArrowUpRight, TrendingUp } from 'lucide-react';
import { getSeriesRoute } from '@/lib/utils';
import type { Video, Series, Creator } from '@/types';

interface SearchResult {
  videos: Video[];
  shorts: Video[];
  series: Series[];
  creators: Creator[];
}

interface MobileSearchResultsProps {
  results: SearchResult;
  query: string;
  onItemClick: (href: string, searchQuery?: string) => void;
}

export function MobileSearchResults({ results, query, onItemClick }: MobileSearchResultsProps) {
  return (
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
              onClick={() => onItemClick(`/videos/${video.id}`)}
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
                onClick={() => onItemClick(`/shorts/${short.uuid}`)}
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
              onClick={() => onItemClick(getSeriesRoute(s.id, s.title))}
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
              onClick={() => onItemClick(`/creators/creator-profile/${creator.id}`)}
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
          onClick={() => onItemClick(`/searches?q=${encodeURIComponent(query)}`)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-primary bg-red-primary/10 hover:bg-red-primary/20 rounded-lg transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          See all results for &quot;{query}&quot;
        </button>
      </div>
    </div>
  );
}

