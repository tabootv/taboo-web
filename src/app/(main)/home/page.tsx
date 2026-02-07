import { fetchHomeData } from '@/shared/lib/api/home-data';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { HomeContent } from './home-content';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Discover premium video content, educational courses, and connect with creators on TabooTV. Browse trending videos, explore series, and find your next favorite creator.',
  alternates: {
    canonical: '/home',
  },
  openGraph: {
    title: 'Home | TabooTV',
    description:
      'Discover premium video content, educational courses, and connect with creators on TabooTV.',
    type: 'website',
    url: '/home',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Home | TabooTV',
    description:
      'Discover premium video content, educational courses, and connect with creators on TabooTV.',
  },
};

export default async function HomePage() {
  const initialData = await fetchHomeData({ cursor: null, includeStatic: true });

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeContent initialData={initialData} />
    </Suspense>
  );
}

function HomePageSkeleton() {
  return (
    <>
      <div className="relative w-full aspect-21/9 bg-surface animate-pulse" />

      <div className="w-full page-px flex flex-col gap-6 md:gap-8 lg:gap-10 mt-8 md:mt-12">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="shrink-0">
              <div className="w-[90px] h-[90px] rounded-full bg-surface animate-pulse" />
            </div>
          ))}
        </div>

        <div>
          <div className="h-7 w-32 bg-surface rounded animate-pulse mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[280px]">
                <div className="aspect-video rounded-lg bg-surface animate-pulse" />
                <div className="h-4 w-3/4 bg-surface rounded animate-pulse mt-2" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="h-7 w-32 bg-surface rounded animate-pulse mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[180px]">
                <div className="aspect-9/16 rounded-lg bg-surface animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
