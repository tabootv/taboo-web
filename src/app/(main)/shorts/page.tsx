'use client';

import { useToggleShortLike } from '@/api/mutations/shorts.mutations';
import { ShortVideoCard, useShortsFeed, useShortsUrlSync } from '@/features/shorts';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useShortsStore } from '@/lib/stores/shorts-store';
import { ChevronDown, ChevronUp, Loader2, LogIn, Video } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { EffectCreative, Mousewheel, Virtual } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/virtual';
import 'swiper/css/effect-creative';

export default function ShortsPage() {
  const router = useRouter();

  const { isAuthenticated } = useAuthStore();
  const { toggleMute, setShowComments } = useShortsStore();

  // Fetch shorts feed (no initial UUID for index page)
  const {
    shorts,
    initialIndex,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    hasFetched,
    refetch,
  } = useShortsFeed();

  // URL synchronization with state machine
  // Use first video's UUID or empty string for index page
  const firstUuid = shorts[0]?.uuid ?? '';
  const {
    currentIndex,
    currentUuid,
    isReady,
    handleSwiperInit,
    handleSlideChange,
    swiperRef,
  } = useShortsUrlSync({
    shorts,
    initialUuid: firstUuid,
    initialIndex,
    isLoading,
  });

  // Like mutation
  const toggleLike = useToggleShortLike();

  // Preload more when near end
  useEffect(() => {
    if (isReady && currentIndex >= shorts.length - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [currentIndex, shorts.length, hasNextPage, isFetchingNextPage, fetchNextPage, isReady]);

  // Close comments when switching videos
  useEffect(() => {
    if (isReady) {
      setShowComments(false);
    }
  }, [currentIndex, isReady, setShowComments]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isReady) return;

      switch (e.key.toLowerCase()) {
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'l':
          e.preventDefault();
          if (currentUuid) {
            toggleLike.mutate(currentUuid, {
              onError: () => toast.error('Please login to like'),
            });
          }
          break;
        case 'arrowdown':
        case 'j':
          e.preventDefault();
          swiperRef.current?.slideNext();
          break;
        case 'arrowup':
        case 'k':
          e.preventDefault();
          swiperRef.current?.slidePrev();
          break;
        case 'escape':
          router.push('/home');
          break;
      }
    },
    [toggleMute, currentUuid, toggleLike, router, isReady, swiperRef]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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
      className="fixed top-14 left-0 right-0 bottom-0 bg-black overflow-hidden z-30 lg:left-[72px]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Full screen swiper */}
      <Swiper
        modules={[Virtual, Mousewheel, EffectCreative]}
        direction="vertical"
        slidesPerView={1}
        spaceBetween={0}
        mousewheel={{
          sensitivity: 0.5,
          thresholdDelta: 70,
          thresholdTime: 400,
          forceToAxis: true,
          releaseOnEdges: false,
        }}
        virtual={{
          enabled: true,
          addSlidesAfter: 3,
          addSlidesBefore: 2,
        }}
        effect="creative"
        creativeEffect={{
          prev: {
            translate: [0, '-100%', 0],
            scale: 0.95,
            opacity: 0.5,
          },
          next: {
            translate: [0, '100%', 0],
            scale: 0.95,
            opacity: 0.5,
          },
          limitProgress: 2,
        }}
        speed={350}
        threshold={8}
        resistanceRatio={0.65}
        touchRatio={1.2}
        longSwipesRatio={0.25}
        shortSwipes={true}
        followFinger={true}
        allowTouchMove={true}
        touchStartPreventDefault={false}
        cssMode={false}
        grabCursor={true}
        onSwiper={handleSwiperInit}
        onSlideChange={handleSlideChange}
        className="h-full w-full shorts-swiper"
      >
        {shorts.map((video, index) => {
          const isActive = currentIndex === index;
          const isNearActive = !isActive && Math.abs(currentIndex - index) <= 2;

          return (
            <SwiperSlide
              key={video.uuid}
              virtualIndex={index}
              className="!h-full !w-full"
            >
              <ShortVideoCard
                video={video}
                index={index}
                isActive={isActive}
                isNearActive={isNearActive}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Navigation buttons - Desktop only */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3 z-50">
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all backdrop-blur-sm border border-white/10"
          aria-label="Previous short"
        >
          <ChevronUp className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => swiperRef.current?.slideNext()}
          disabled={currentIndex >= shorts.length - 1}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all backdrop-blur-sm border border-white/10"
          aria-label="Next short"
        >
          <ChevronDown className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      )}
    </div>
  );
}
