'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import { search as searchApi } from '@/lib/api';
import type { Video, Series, Creator } from '@/types';
import { Spinner } from '@/components/ui';
import { formatCompactNumber, formatDuration } from '@/lib/utils';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    videos: Video[];
    series: Series[];
    creators: Creator[];
  }>({
    videos: [],
    series: [],
    creators: [],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ videos: [], series: [], creators: [] });
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await searchApi.search(query);
        setResults({
          videos: data.videos || [],
          series: data.series || [],
          creators: data.creators || [],
        });
      } catch (err) {
        console.error('Search failed:', err);
        setError('Failed to load search results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const hasResults =
    results.videos.length > 0 ||
    results.series.length > 0 ||
    results.creators.length > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-8">
          Searching for &quot;{query}&quot;...
        </h1>
        <div className="space-y-8">
          {/* Videos skeleton */}
          <section>
            <div className="h-6 w-24 bg-surface rounded animate-pulse mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-video bg-surface rounded-lg animate-pulse" />
                  <div className="mt-2 h-4 bg-surface rounded animate-pulse w-3/4" />
                  <div className="mt-1 h-3 bg-surface rounded animate-pulse w-1/2" />
                </div>
              ))}
            </div>
          </section>
          {/* Series skeleton */}
          <section>
            <div className="h-6 w-24 bg-surface rounded animate-pulse mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-video bg-surface rounded-lg animate-pulse" />
              ))}
            </div>
          </section>
          {/* Creators skeleton */}
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
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-primary hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // No query state
  if (!query.trim()) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <SearchIcon className="w-16 h-16 mx-auto text-text-secondary mb-4" />
          <h2 className="text-xl font-medium text-text-primary mb-2">
            Search TabooTV
          </h2>
          <p className="text-text-secondary">
            Enter a search term to find videos, series, and creators
          </p>
        </div>
      </div>
    );
  }

  // No results state
  if (!hasResults) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-8">
          Results for &quot;{query}&quot;
        </h1>
        <div className="text-center py-20">
          <SearchIcon className="w-16 h-16 mx-auto text-text-secondary mb-4 opacity-50" />
          <p className="text-text-secondary">
            No results found for &quot;{query}&quot;
          </p>
        </div>
      </div>
    );
  }

  // Results
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-8">
        Results for &quot;{query}&quot;
      </h1>

      <div className="space-y-10">
        {/* Videos Section */}
        {results.videos.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {results.videos.map((video) => (
                <VideoCard key={video.uuid} video={video} />
              ))}
            </div>
          </section>
        )}

        {/* Series Section */}
        {results.series.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Series</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.series.map((series) => (
                <SeriesCard key={series.uuid} series={series} />
              ))}
            </div>
          </section>
        )}

        {/* Creators Section */}
        {results.creators.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Creators</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {results.creators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// Video Card Component
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
        <p className="text-xs text-text-secondary">
          {formatCompactNumber(video.views_count ?? 0)} views
        </p>
      </div>
    </Link>
  );
}

// Series Card Component
function SeriesCard({ series }: { series: Series }) {
  return (
    <Link href={`/series/${series.uuid}`} className="group">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface">
        {series.thumbnail && (
          <Image
            src={series.thumbnail}
            alt={series.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-bold text-white">{series.title}</h3>
          <p className="text-sm text-gray-300">{series.videos_count} episodes</p>
        </div>
      </div>
    </Link>
  );
}

// Creator Card Component
function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <Link
      href={`/creators/creator-profile/${creator.id}`}
      className="flex flex-col items-center p-4 bg-surface border border-border rounded-xl hover:border-red-primary/50 transition-all"
    >
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-surface mb-3">
        {creator.dp && (
          <Image src={creator.dp} alt={creator.name} fill className="object-cover" />
        )}
      </div>
      <h3 className="font-medium text-text-primary text-center line-clamp-1">
        {creator.name}
      </h3>
      <p className="text-xs text-text-secondary">
        {formatCompactNumber(creator.subscribers_count ?? 0)} subscribers
      </p>
    </Link>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
