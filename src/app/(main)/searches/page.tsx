'use client';

import { Spinner } from '@/components/ui';
import { useMixedSearch } from '@/hooks/useMixedSearch';
import { formatDuration } from '@/lib/utils';
import type { Creator, Video } from '@/types';
import { Search as SearchIcon, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);

  const {
    filteredVideos,
    filteredCreators,
    isLoading,
    countryHeader,
    hasResults,
  } = useMixedSearch(query);

  useEffect(() => {
    if (query !== initialQuery) {
      const url = new URL(window.location.href);
      if (query.trim()) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, [query, initialQuery]);

  const clearSearch = () => {
    setQuery('');
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 min-h-screen">
      {/* Search Input */}
      <div className="relative w-full mb-8">
        <div className="relative w-full">
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
        {isLoading && (
          <div className="absolute right-14 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && query && (
        <div className="space-y-8">
          <section>
            <div className="h-6 w-24 bg-surface rounded animate-pulse mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-video bg-surface rounded-lg animate-pulse" />
                  <div className="mt-2 h-4 bg-surface rounded animate-pulse w-3/4" />
                  <div className="mt-1 h-3 bg-surface rounded animate-pulse w-1/2" />
                </div>
              ))}
            </div>
          </section>
          <section>
            <div className="h-6 w-24 bg-surface rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center p-4">
                  <div className="w-20 h-20 rounded-full bg-surface animate-pulse" />
                  <div className="mt-3 h-4 w-16 bg-surface rounded animate-pulse" />
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Empty State - No Query */}
      {!query && !hasResults && (
        <div className="text-center py-20">
          <SearchIcon className="w-16 h-16 mx-auto text-text-secondary mb-4" />
          <h2 className="text-xl font-medium text-text-primary mb-2">Search TabooTV</h2>
          <p className="text-text-secondary">Find videos and creators</p>
        </div>
      )}

      {/* Empty State - No Results */}
      {query && !hasResults && !isLoading && (
        <div className="text-center py-20">
          <SearchIcon className="w-16 h-16 mx-auto text-text-secondary mb-4 opacity-50" />
          <p className="text-text-secondary">No results found for &quot;{query}&quot;</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && hasResults && (
        <div className="space-y-10">
          {/* Videos Section */}
          {filteredVideos.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Videos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredVideos.map((video) => (
                  <VideoCard key={video.uuid || video.id} video={video} />
                ))}
              </div>
            </section>
          )}

          {/* Creators Section */}
          {filteredCreators.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-4">{countryHeader}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredCreators.map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))}
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
        {creator.dp && <Image src={creator.dp} alt={creator.name} fill className="object-cover" />}
      </div>
      <h3 className="font-medium text-text-primary text-center line-clamp-1">{creator.name}</h3>
    </Link>
  );
}

export default function SearchesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
