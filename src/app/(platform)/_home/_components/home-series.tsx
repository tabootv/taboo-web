'use client';

import { useSeries } from '@/api/queries/home.queries';
import type { Series } from '@/types';
import { useEffect, useState } from 'react';
import { SeriesSection } from './SeriesSection';
import { SeriesSidePanel } from './SeriesSidePanel';
import { SeriesSkeleton } from './SeriesSkeleton';
import { VerticalSeriesList } from './VerticalSeriesList';

interface HomeSeriesSectionProps {
  initialSeries?: Series[];
}

export function HomeSeriesSection({ initialSeries }: HomeSeriesSectionProps) {
  const { data: series = [], isLoading } = useSeries(
    initialSeries ? { initialData: initialSeries } : {}
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(series.length - 1, prev + 1));
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [series.length]);

  const selectedSeries = series[selectedIndex] || null;

  if (isLoading) {
    return <SeriesSkeleton />;
  }

  if (series.length === 0) return null;

  return (
    <SeriesSection>
      <div className="grid lg:grid-cols-[340px_1fr] gap-4 lg:gap-6 items-start lg:items-stretch">
        <VerticalSeriesList
          series={series}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />
        <SeriesSidePanel series={selectedSeries} />
      </div>
    </SeriesSection>
  );
}
