'use client';

import { useShortsFeed } from '@/features/shorts/hooks/use-shorts-feed';
import { useShortsKeyboard } from '@/features/shorts/hooks/use-shorts-keyboard';
import { useShortsUrlSync } from '@/features/shorts/hooks/use-shorts-url-sync';
import { useVerticalFeed } from '@/features/shorts/hooks/use-vertical-feed';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useShortsStore } from '@/shared/stores/shorts-store';
import { Loader2, LogIn, Video } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ShortSlide } from './short-slide';
import { ShortsNavigation } from './shorts-navigation';

interface ShortsFeedContainerProps {
  initialUuid?: string;
}

export function ShortsFeedContainer({ initialUuid }: ShortsFeedContainerProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { setShowComments } = useShortsStore();

  // Hydration guard: prevent URL sync during SSR/hydration mismatch
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const {
    shorts,
    initialIndex,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    initialError,
    hasFetched,
    refetch,
    isReadyForUrlSync,
  } = useShortsFeed(initialUuid ? { initialUuid } : {});

  const {
    currentIndex,
    transform,
    containerRef,
    containerProps,
    goToNext,
    goToPrevious,
    getSlideClass,
  } = useVerticalFeed({
    itemCount: shorts.length,
    initialIndex,
    onIndexChange: (index) => {
      if (index >= shorts.length - 3 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  useShortsUrlSync({
    shorts,
    currentIndex,
    enabled: !isLoading && shorts.length > 0 && isReadyForUrlSync && isHydrated,
    initialUuid,
  });

  useShortsKeyboard({
    currentUuid: shorts[currentIndex]?.uuid,
    goToNext,
    goToPrevious,
    enabled: !isLoading && shorts.length > 0,
  });

  useEffect(() => {
    setShowComments(false);
  }, [currentIndex, setShowComments]);

  const windowedSlides = useMemo(() => {
    if (shorts.length === 0) return { slides: [], startSpacer: 0, endSpacer: 0 };

    const bufferBefore = 1;
    const bufferAfter = 2;
    const startIndex = Math.max(0, currentIndex - bufferBefore);
    const endIndex = Math.min(shorts.length - 1, currentIndex + bufferAfter);

    const visibleSlides = shorts.slice(startIndex, endIndex + 1).map((video, relativeIndex) => ({
      video,
      index: startIndex + relativeIndex,
    }));

    return {
      slides: visibleSlides,
      startSpacer: startIndex,
      endSpacer: shorts.length - 1 - endIndex,
    };
  }, [shorts, currentIndex]);

  if (isLoading && shorts.length === 0) {
    return (
      <div className="fixed top-14 left-0 right-0 bottom-0 bg-black flex items-center justify-center z-30 lg:left-[72px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-red-primary animate-spin" />
          <p className="text-white/60 text-sm">Loading shorts...</p>
        </div>
      </div>
    );
  }

  // Still merging initial short - show loading to prevent flash of wrong content
  if (initialUuid && !isReadyForUrlSync && !initialError) {
    return (
      <div className="fixed top-14 left-0 right-0 bottom-0 bg-black flex items-center justify-center z-30 lg:left-[72px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-red-primary animate-spin" />
          <p className="text-white/60 text-sm">Loading shorts...</p>
        </div>
      </div>
    );
  }

  if (initialError && initialUuid && shorts.length === 0 && hasFetched) {
    return (
      <div className="fixed top-14 left-0 right-0 bottom-0 bg-black flex flex-col items-center justify-center gap-4 z-30 lg:left-[72px]">
        <Video className="w-16 h-16 text-white/30 mb-2" />
        <p className="text-white font-medium text-lg">Short not found</p>
        <p className="text-white/50 text-sm text-center px-4">
          This short may have been removed or is no longer available.
        </p>
        <button
          onClick={() => router.push('/shorts')}
          className="mt-2 px-6 py-2.5 bg-red-primary text-white rounded-full font-medium hover:bg-red-primary/80 transition-colors"
        >
          Browse Shorts
        </button>
      </div>
    );
  }

  if (error && shorts.length === 0) {
    return (
      <div className="fixed top-14 left-0 right-0 bottom-0 bg-black flex flex-col items-center justify-center gap-4 z-30 lg:left-[72px]">
        <Video className="w-16 h-16 text-white/30 mb-2" />
        {!isAuthenticated ? (
          <>
            <p className="text-white font-medium text-lg">Sign in to view shorts</p>
            <p className="text-white/50 text-sm">Access exclusive short-form content</p>
            <Link
              href="/sign-in"
              className="mt-2 px-6 py-2.5 bg-red-primary text-white rounded-full font-medium hover:bg-red-primary/80 transition-colors flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          </>
        ) : (
          <>
            <p className="text-red-400">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 bg-red-primary text-white rounded-full font-medium hover:bg-red-primary/80 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    );
  }

  if (shorts.length === 0 && hasFetched) {
    return (
      <div className="fixed top-14 left-0 right-0 bottom-0 bg-black flex flex-col items-center justify-center gap-4 z-30 lg:left-[72px]">
        <Video className="w-16 h-16 text-white/30 mb-2" />
        {!isAuthenticated ? (
          <>
            <p className="text-white font-medium text-lg">Sign in to view shorts</p>
            <p className="text-white/50 text-sm">Access exclusive short-form content</p>
            <Link
              href="/sign-in"
              className="mt-2 px-6 py-2.5 bg-red-primary text-white rounded-full font-medium hover:bg-red-primary/80 transition-colors flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          </>
        ) : (
          <>
            <p className="text-white/50 text-lg">No shorts available</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2.5 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-colors"
            >
              Go Home
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="shorts-feed-container top-14 left-0 right-0 bottom-0 z-30 lg:left-[72px]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      {...containerProps}
    >
      <div className="shorts-posts-wrapper" style={{ transform }}>
        {windowedSlides.startSpacer > 0 && (
          <div
            className="short-slide-spacer"
            style={{ height: `calc(${windowedSlides.startSpacer} * (100dvh - 56px))` }}
            aria-hidden="true"
          />
        )}

        {windowedSlides.slides.map(({ video, index }) => (
          <ShortSlide
            key={video.uuid}
            video={video}
            slideClass={getSlideClass(index)}
            isActive={index === currentIndex}
            isNearActive={Math.abs(index - currentIndex) <= 1}
          />
        ))}

        {windowedSlides.endSpacer > 0 && (
          <div
            className="short-slide-spacer"
            style={{ height: `calc(${windowedSlides.endSpacer} * (100dvh - 56px))` }}
            aria-hidden="true"
          />
        )}
      </div>

      <ShortsNavigation
        onPrevious={goToPrevious}
        onNext={goToNext}
        canGoPrevious={currentIndex > 0}
        canGoNext={currentIndex < shorts.length - 1}
      />

      {isFetchingNextPage && (
        <div className="shorts-loading-more">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      )}
    </div>
  );
}
