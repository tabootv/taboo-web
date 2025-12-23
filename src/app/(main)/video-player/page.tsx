'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingScreen } from '@/components/ui';

function VideoPlayerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = searchParams.get('video');
  const uuid = searchParams.get('uuid');

  useEffect(() => {
    // Redirect to the proper video play route
    if (uuid) {
      router.replace(`/videos/${uuid}`);
    } else if (videoId) {
      router.replace(`/videos/${videoId}`);
    } else {
      router.replace('/videos');
    }
  }, [videoId, uuid, router]);

  return <LoadingScreen message="Loading player..." />;
}

export default function VideoPlayerPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading player..." />}>
      <VideoPlayerContent />
    </Suspense>
  );
}
