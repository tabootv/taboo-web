'use client';

import { homeClient } from '@/api/client/home.client';
import type { Series } from '@/types';
import { useEffect, useState } from 'react';
import { SeriesSection } from './components/SeriesSection';
import { SeriesSidePanel } from './components/SeriesSidePanel';
import { SeriesSkeleton } from './components/SeriesSkeleton';
import { VerticalSeriesList } from './components/VerticalSeriesList';

interface HomeSeriesSectionProps {
  initialSeries?: Series[];
}

export function HomeSeriesSection({ initialSeries }: HomeSeriesSectionProps) {
  const hasInitialData = initialSeries && initialSeries.length > 0;
  const [series, setSeries] = useState<Series[]>(initialSeries || []);
  const [isLoading, setIsLoading] = useState(!hasInitialData);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (initialSeries && initialSeries.length > 0) return;

    async function fetchSeries() {
      try {
        const data = await homeClient.getSeries();
        setSeries(data || []);
      } catch (error) {
        console.error('Error fetching series:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSeries();
  }, [initialSeries]);

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
