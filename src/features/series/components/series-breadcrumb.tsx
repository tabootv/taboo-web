'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getSeriesRoute } from '@/lib/utils';

interface SeriesBreadcrumbProps {
  seriesId: string;
  seriesTitle: string;
  currentEpisodeIndex: number;
  isCourse: boolean;
}

export function SeriesBreadcrumb({
  seriesId,
  seriesTitle,
  currentEpisodeIndex,
  isCourse,
}: SeriesBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-white/50 mb-4">
      <Link href="/series" className="hover:text-white transition-colors">
        Series
      </Link>
      <ChevronRight className="w-4 h-4" />
      <Link
        href={getSeriesRoute(seriesId, seriesTitle)}
        className="hover:text-white transition-colors truncate max-w-[200px]"
      >
        {seriesTitle}
      </Link>
      <ChevronRight className="w-4 h-4" />
      <span className="text-white/70 truncate">
        {isCourse ? 'Episode' : 'Part'} {currentEpisodeIndex + 1}
      </span>
    </nav>
  );
}

