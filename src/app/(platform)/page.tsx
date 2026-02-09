import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  BannerSection,
  CreatorsSectionServer,
  FeaturedSectionServer,
  ShortsSectionServer,
  RecommendedSectionServer,
  SeriesSectionServer,
  PlaylistsSectionServer,
} from './_home/_sections';
import {
  BannerSkeleton,
  CreatorsSkeleton,
  FeaturedSkeleton,
  ShortsSkeleton,
  RecommendedSkeleton,
  SeriesSkeleton,
  PlaylistsSkeleton,
} from './_home/_sections/skeletons';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Discover premium video content, educational courses, and connect with creators on TabooTV. Browse trending videos, explore series, and find your next favorite creator.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Home | TabooTV',
    description:
      'Discover premium video content, educational courses, and connect with creators on TabooTV.',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Home | TabooTV',
    description:
      'Discover premium video content, educational courses, and connect with creators on TabooTV.',
  },
};

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<BannerSkeleton />}>
        <BannerSection />
      </Suspense>

      <div className="w-full page-px flex flex-col gap-5 sm:gap-6 md:gap-8 lg:gap-10 mt-4 sm:mt-8 md:mt-12 relative z-10">
        <Suspense fallback={<CreatorsSkeleton />}>
          <CreatorsSectionServer />
        </Suspense>
        <Suspense fallback={<FeaturedSkeleton />}>
          <FeaturedSectionServer />
        </Suspense>
        <Suspense fallback={<ShortsSkeleton />}>
          <ShortsSectionServer />
        </Suspense>
        <Suspense fallback={<RecommendedSkeleton />}>
          <RecommendedSectionServer />
        </Suspense>
        <Suspense fallback={<SeriesSkeleton />}>
          <SeriesSectionServer />
        </Suspense>
        <Suspense fallback={<PlaylistsSkeleton />}>
          <PlaylistsSectionServer />
        </Suspense>
      </div>
    </>
  );
}
