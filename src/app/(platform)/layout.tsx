import { Suspense } from 'react';
import { MainLayout } from '@/components/layout';
import { CreatorsProvider } from '@/components/providers/creators-provider';
import { AccessGate } from '@/shared/components/providers/access-gate';
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

export default async function MainGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout>
      <Suspense fallback={<LayoutFallback />}>
        <CreatorsProvider>
          <AccessGate>{children}</AccessGate>
        </CreatorsProvider>
      </Suspense>
    </MainLayout>
  );
}
