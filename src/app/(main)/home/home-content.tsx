'use client';

import { useState, useEffect } from 'react';
import {
  BannerSlider,
  CreatorsSection,
  FeaturedSection,
  HomeShortsSection,
  RecommendedSection,
  HomeSeriesSection,
} from '@/components/home';
import { PlaylistsInfiniteScroll } from './playlists-infinite-scroll';
import type { HomePageData } from '@/lib/api/home-data';

interface HomeContentProps {
  initialData: HomePageData;
}

/**
 * Home Content - Client Component
 *
 * Handles all interactive parts of the home page:
 * - Renders static sections (banners, creators, featured, shorts, recommended, series)
 * - Manages infinite scroll for playlists with real cursor pagination
 */
export function HomeContent({ initialData }: HomeContentProps) {
  // Generate unique key on mount to force shorts to reshuffle each visit
  const [shortsKey, setShortsKey] = useState(() => Date.now());

  // Update key on each mount (handles navigation back to home)
  useEffect(() => {
    setShortsKey(Date.now());
  }, []);

  return (
    <>
      {/* Hero Banner Slider - full-width, no rounded corners, goes behind header */}
      <div className="relative w-full">
        <BannerSlider initialBanners={initialData.static?.banners || []} />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col w-full gap-5 sm:gap-6 md:gap-8 lg:gap-10 mt-4 sm:mt-8 md:mt-12 relative z-10 overflow-x-hidden">
        {/* Static Sections - loaded once */}
        <CreatorsSection initialCreators={initialData.static?.creators || []} />
        <FeaturedSection initialVideos={initialData.static?.featured || []} />
        <HomeShortsSection key={shortsKey} initialShorts={initialData.static?.shorts || []} />

        {/* Recommended - shown once (not paginated) */}
        <RecommendedSection initialVideos={initialData.static?.recommended || []} />

        {/* Series - shown once (not paginated) */}
        <HomeSeriesSection initialSeries={initialData.static?.series || []} />

        {/* Playlists - infinite scroll with real pagination */}
        <PlaylistsInfiniteScroll
          initialPlaylists={initialData.playlists}
          initialCursor={initialData.nextCursor}
          isInitialLastPage={initialData.isLastPage}
        />
      </div>
    </>
  );
}
