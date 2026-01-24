'use client';

import { BannerSlider } from './_components/banner-slider';
import { CreatorsSection } from './_components/creators';
import { EndOfContentMessage } from './_components/end-of-content-message';
import { FeaturedSection } from './_components/featured';
import { HomeSeriesSection } from './_components/home-series';
import { HomeShortsSection } from './_components/home-shorts';
import { RecommendedSection } from './_components/recommended';
import { useCallback } from 'react';
import type { HomePageData } from '@/lib/api/home-data';
import { useEffect, useState } from 'react';
import { PlaylistsInfiniteScroll } from './playlists-infinite-scroll';

interface HomeContentProps {
  initialData: HomePageData;
}

export function HomeContent({ initialData }: HomeContentProps) {
  const [shortsKey, setShortsKey] = useState(() => Date.now());
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  useEffect(() => {
    setShortsKey(Date.now());
  }, []);

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <div className="relative w-full">
        <BannerSlider initialBanners={initialData.static?.banners || []} />
      </div>

      <div className="w-full px-[4%] flex flex-col gap-5 sm:gap-6 md:gap-8 lg:gap-10 mt-4 sm:mt-8 md:mt-12 relative z-10">
        <CreatorsSection initialCreators={initialData.static?.creators || []} />
        <FeaturedSection initialVideos={initialData.static?.featured || []} />
        <HomeShortsSection key={shortsKey} initialShorts={initialData.static?.shorts || []} />

        <RecommendedSection initialVideos={initialData.static?.recommended || []} />

        <HomeSeriesSection initialSeries={initialData.static?.series || []} />

        <PlaylistsInfiniteScroll
          initialPlaylists={initialData.playlists}
          initialCursor={initialData.nextCursor}
          isInitialLastPage={initialData.isLastPage}
          onLastPageReached={setHasReachedEnd}
        />

        {hasReachedEnd && (
          <EndOfContentMessage onScrollToTop={handleScrollToTop} />
        )}
      </div>
    </>
  );
}
