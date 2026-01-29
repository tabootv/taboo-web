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
import { useEffect, useMemo } from 'react';
import { ShortSlide } from './short-slide';
import { ShortsNavigation } from './shorts-navigation';

interface ShortsFeedContainerProps {
  initialUuid?: string;
}

export function ShortsFeedContainer({ initialUuid }: ShortsFeedContainerProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { setShowComments } = useShortsStore();

  // Data fetching - reuse existing API layer
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
  } = useShortsFeed(initialUuid ? { initialUuid } : {});

  // Core navigation - NEW hook (translated from Vue)
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
      // Preload more when near end
      if (index >= shorts.length - 3 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  // URL synchronization - NEW simplified hook
  useShortsUrlSync({
    shorts,
    currentIndex,
    enabled: !isLoading && shorts.length > 0,
  });

  // Keyboard shortcuts - NEW dedicated hook
  useShortsKeyboard({
    currentUuid: shorts[currentIndex]?.uuid,
    goToNext,
    goToPrevious,
    enabled: !isLoading && shorts.length > 0,
  });

  // Close comments when switching videos
  useEffect(() => {
    setShowComments(false);
  }, [currentIndex, setShowComments]);

  // Windowing: only render visible slides + buffer (like React Native FlatList)
  const windowedSlides = useMemo(() => {
    if (shorts.length === 0) return { slides: [], startSpacer: 0, endSpacer: 0 };

    // Calculate visible range: prev, current, next, next+1 (buffer of 2 ahead)
    const bufferBefore = 1;
    const bufferAfter = 2;
    const startIndex = Math.max(0, currentIndex - bufferBefore);
    const endIndex = Math.min(shorts.length - 1, currentIndex + bufferAfter);

    // Get slides in visible range
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

  // Loading state
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

  // Deep link error - specific short not found but we have other shorts to show
  if (initialError && initialUuid && shorts.length > 0) {
    // Show a toast notification but continue with the feed
    // The user can browse other available shorts
  }

  // Deep link error - specific short not found and no other shorts available
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

  // Error state
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

  // Empty state
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
              onClick={() => router.push('/home')}
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
      className="shorts-feed-container mt-[56px] top-14 left-0 right-0 bottom-0 z-30 lg:left-[72px]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      {...containerProps}
    >
      {/* Posts wrapper with CSS transform */}
      <div className="shorts-posts-wrapper" style={{ transform }}>
        {/* Spacer for slides before visible window */}
        {windowedSlides.startSpacer > 0 && (
          <div
            className="short-slide-spacer"
            style={{ height: `calc(${windowedSlides.startSpacer} * (100dvh - 56px))` }}
            aria-hidden="true"
          />
        )}

        {/* Render only visible slides + buffer */}
        {windowedSlides.slides.map(({ video, index }) => (
          <ShortSlide
            key={video.uuid}
            video={video}
            slideClass={getSlideClass(index)}
            isActive={index === currentIndex}
            isNearActive={Math.abs(index - currentIndex) <= 1}
          />
        ))}

        {/* Spacer for slides after visible window */}
        {windowedSlides.endSpacer > 0 && (
          <div
            className="short-slide-spacer"
            style={{ height: `calc(${windowedSlides.endSpacer} * (100dvh - 56px))` }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Navigation buttons - Desktop only */}
      <ShortsNavigation
        onPrevious={goToPrevious}
        onNext={goToNext}
        canGoPrevious={currentIndex > 0}
        canGoNext={currentIndex < shorts.length - 1}
      />

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="shorts-loading-more">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      )}
    </div>
  );
}
