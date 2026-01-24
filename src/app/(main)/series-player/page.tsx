'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingScreen } from '@/components/ui/spinner';
import { getSeriesRoute, getSeriesPlayRoute } from '@/lib/utils';

function SeriesPlayerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const seriesId = searchParams.get('series');
  const seriesTitle = searchParams.get('title') || undefined;
  const episodeId = searchParams.get('episode');

  useEffect(() => {
    // Redirect to the proper series play route
    if (seriesId && episodeId) {
      router.replace(getSeriesPlayRoute(seriesId, seriesTitle, episodeId));
    } else if (seriesId) {
      router.replace(getSeriesRoute(seriesId, seriesTitle));
    } else {
      router.replace('/series');
    }
  }, [seriesId, seriesTitle, episodeId, router]);

  return <LoadingScreen message="Loading player..." />;
}

export default function SeriesPlayerPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading player..." />}>
      <SeriesPlayerContent />
    </Suspense>
  );
}
