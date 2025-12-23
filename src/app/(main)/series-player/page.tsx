'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingScreen } from '@/components/ui';

function SeriesPlayerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const seriesId = searchParams.get('series');
  const episodeId = searchParams.get('episode');

  useEffect(() => {
    // Redirect to the proper series play route
    if (seriesId && episodeId) {
      router.replace(`/series/${seriesId}/play/${episodeId}`);
    } else if (seriesId) {
      router.replace(`/series/${seriesId}`);
    } else {
      router.replace('/series');
    }
  }, [seriesId, episodeId, router]);

  return <LoadingScreen message="Loading player..." />;
}

export default function SeriesPlayerPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading player..." />}>
      <SeriesPlayerContent />
    </Suspense>
  );
}
