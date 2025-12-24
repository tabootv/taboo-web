/**
 * Series section wrapper with header
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface SeriesSectionProps {
  title?: string;
  viewAllHref?: string;
  children: React.ReactNode;
}

export function SeriesSection({ title = 'Top Series', viewAllHref = '/series', children }: SeriesSectionProps) {
  return (
    <section className="mt-8 md:mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-white">{title}</h2>
        <Link
          href={viewAllHref}
          className="group flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      {children}
    </section>
  );
}

