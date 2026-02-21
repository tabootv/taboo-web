'use client';

import { ShakaPreloader } from '@/app/(platform)/videos/[id]/_components/shaka-preloader';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { StudioWatchPlayer } from './_components/studio-watch-player';

function StudioWatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoUuid = searchParams.get('v');

  useEffect(() => {
    if (!videoUuid) {
      router.replace('/studio');
    }
  }, [videoUuid, router]);

  if (!videoUuid) return null;

  return (
    <>
      <ShakaPreloader />
      <StudioWatchPlayer videoUuid={videoUuid} />
    </>
  );
}

export default function StudioWatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-red-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <StudioWatchContent />
    </Suspense>
  );
}
