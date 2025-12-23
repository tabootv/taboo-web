import { Suspense } from 'react';
import { HomeContent } from './home-content';
import { fetchHomeData } from '@/lib/api/home-data';

/**
 * Home Page - Server Component
 *
 * Fetches initial home data server-side for faster first paint,
 * then hydrates with client-side interactivity.
 */
export default async function HomePage() {
  // Fetch initial data server-side
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
      {/* Banner skeleton */}
      <div className="relative w-full aspect-[21/9] bg-surface animate-pulse" />

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col w-full gap-6 md:gap-8 lg:gap-10 mt-8 md:mt-12">
        {/* Creators skeleton */}
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex-shrink-0">
              <div className="w-[90px] h-[90px] rounded-full bg-surface animate-pulse" />
            </div>
          ))}
        </div>

        {/* Featured skeleton */}
        <div>
          <div className="h-7 w-32 bg-surface rounded animate-pulse mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[280px]">
                <div className="aspect-video rounded-lg bg-surface animate-pulse" />
                <div className="h-4 w-3/4 bg-surface rounded animate-pulse mt-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Shorts skeleton */}
        <div>
          <div className="h-7 w-32 bg-surface rounded animate-pulse mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[180px]">
                <div className="aspect-[9/16] rounded-lg bg-surface animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
