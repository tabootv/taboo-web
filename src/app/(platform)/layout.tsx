import { MainLayout } from '@/components/layout';
import { CreatorsProvider } from '@/components/providers/creators-provider';
import { AccessGate } from '@/shared/components/providers/access-gate';
import { Suspense } from 'react';
import {
  BannerSkeleton,
  CreatorsSkeleton,
  FeaturedSkeleton,
  ShortsSkeleton,
} from './_home/_sections/skeletons';

function LayoutFallback() {
  return (
    <>
      <BannerSkeleton />
      <div className="w-full page-px flex flex-col gap-5 sm:gap-6 md:gap-8 lg:gap-10 mt-4 sm:mt-8 md:mt-12 relative z-10">
        <CreatorsSkeleton />
        <FeaturedSkeleton />
        <ShortsSkeleton />
      </div>
    </>
  );
}

export default async function MainGroupLayout({
  children,
  compose,
}: {
  children: React.ReactNode;
  compose: React.ReactNode;
}) {
  return (
    <MainLayout>
      {/* Pre-establish connection to Bunny.net CDN for faster video loading */}
      <link rel="preconnect" href="https://video.bunnycdn.com" />
      <link rel="dns-prefetch" href="https://video.bunnycdn.com" />

      <Suspense fallback={<LayoutFallback />}>
        <CreatorsProvider>
          <AccessGate>{children}</AccessGate>
        </CreatorsProvider>
      </Suspense>
      {compose}
    </MainLayout>
  );
}
