'use client';;
import { useSeriesList } from '@/api/queries/series.queries';
import { SeriesCardSkeleton } from './_components/SeriesCardSkeleton';
import { SeriesPremiumCard } from './_components/SeriesPremiumCard';
import { Play } from 'lucide-react';
import { useMemo } from 'react';

export default function SeriesPage() {
  const { data, isLoading } = useSeriesList({
    sort_by: 'newest',
  });

  const seriesList = data || [];

  const skeletonKeys = useMemo(
    () =>
      Array.from(
        { length: 8 },
        (_, i) => `series-skeleton-${i}-${Math.random().toString(36).substring(2, 9)}`
      ),
    []
  );

  return (
    <div className="series-page-atmosphere min-h-screen">
      <div className="series-atmosphere-bg" />

      <div className="relative z-10 max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">Series</h1>

        {isLoading ? (
          <div className="grid-series">
            {skeletonKeys.map((key: string) => (
              <SeriesCardSkeleton key={key} />
            ))}
          </div>
        ) : (
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
