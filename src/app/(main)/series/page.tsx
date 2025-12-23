'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { series as seriesApi } from '@/lib/api';
import type { Series } from '@/types';

export default function SeriesPage() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSeries = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await seriesApi.list({
        sort_by: 'newest',
      });
      setSeriesList(response.series || []);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching series data:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  return (
    <div className="series-page-atmosphere min-h-screen">
      {/* Red Atmosphere Background */}
      <div className="series-atmosphere-bg" />

      <div className="relative z-10 max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-6">
        {/* Page Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">
          Series
        </h1>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid-series">
            {Array.from({ length: 8 }).map((_, index) => (
              <SeriesCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          /* Series Grid */
          <div className="grid-series">
            {seriesList.map((series) => (
              <SeriesPremiumCard key={series.uuid} series={series} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && seriesList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-[#131315] flex items-center justify-center mb-6">
              <Play className="w-8 h-8 text-red-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No series found</h3>
            <p className="text-text-secondary max-w-md">
              Check back later for new dangerous content from our creators.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Clean Series Card Component
function SeriesPremiumCard({ series }: { series: Series; index?: number }) {
  const thumbnail = series.trailer_thumbnail || series.thumbnail || series.card_thumbnail;
  // Use series ID for the URL since the API trailer endpoint uses ID (not UUID)
  const url = `/series/${series.id}`;
  const videoCount = series.videos_count || 0;

  return (
    <Link href={url} className="series-card-clean group">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={series.title}
            fill
            className="object-cover w-full h-full"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-dark to-red-primary" />
        )}

        {/* Series Badge - Top Left */}
        <div className="absolute top-3 left-3 series-type-badge">
          <Play className="w-3 h-3 fill-white" />
          Series
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col">
        {/* Title - Fixed height for 2 lines */}
        <h3 className="text-base font-medium text-white line-clamp-2 min-h-[48px]">
          {series.title}
        </h3>

        {/* Creator Info & Episode Count */}
        <div className="flex items-center justify-between mt-auto pt-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-shrink-0">
              {series.channel?.dp ? (
                <Image
                  src={series.channel.dp}
                  alt={series.channel.name || 'Creator'}
                  width={28}
                  height={28}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {(series.channel?.name || 'C').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Verified Badge */}
              <div className="absolute -bottom-0.5 -right-0.5">
                <VerifiedBadge />
              </div>
            </div>
            <span className="text-sm text-text-secondary truncate">
              {series.channel?.name || 'Creator'}
            </span>
          </div>

          {/* Episode Count Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full">
            <Play className="w-3 h-3 text-red-primary fill-red-primary" />
            <span className="text-xs font-medium text-white/80">
              {videoCount} {videoCount === 1 ? 'episode' : 'episodes'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton Loader for Cards
function SeriesCardSkeleton() {
  return (
    <div className="series-card-clean">
      {/* Thumbnail Skeleton */}
      <div className="aspect-video w-full bg-[#1e1f23] animate-pulse" />
      {/* Content Skeleton */}
      <div className="p-4">
        <div className="h-5 w-3/4 bg-[#1e1f23] rounded animate-pulse mb-3" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1e1f23] animate-pulse" />
          <div className="h-4 w-20 bg-[#1e1f23] rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Verified Badge Component
function VerifiedBadge() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 0L9.79611 1.52786L12.1244 1.52786L12.7023 3.76393L14.7023 5.04508L14.0489 7.29814L14.7023 9.55119L12.7023 10.8323L12.1244 13.0684L9.79611 13.0684L8 14.5963L6.20389 13.0684L3.87564 13.0684L3.29772 10.8323L1.29772 9.55119L1.95106 7.29814L1.29772 5.04508L3.29772 3.76393L3.87564 1.52786L6.20389 1.52786L8 0Z"
        fill="#AB0013"
      />
      <path d="M5.5 7.5L7 9L10.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
