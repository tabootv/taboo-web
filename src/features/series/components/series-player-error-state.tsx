'use client';

import Link from 'next/link';

export function SeriesPlayerErrorState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Episode not found</h1>
        <Link href="/series" className="text-red-primary hover:underline">
          Back to series
        </Link>
      </div>
    </div>
  );
}

