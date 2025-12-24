'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual, Mousewheel, EffectCreative } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ChevronUp, ChevronDown, LogIn, Video, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useShortsStore } from '@/lib/stores/shorts-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ShortVideoCard } from '@/features/shorts';
import { videos as videosApi } from '@/lib/api';
import { toast } from 'sonner';

import 'swiper/css';
import 'swiper/css/virtual';
import 'swiper/css/effect-creative';

export default function ShortPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;
  const swiperRef = useRef<SwiperType | null>(null);
  const isInitializedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const {
    videos,
    currentIndex,
    isLoading,
    isLoadingMore,
    error,
    hasLiked,
    hasFetched,
    fetchVideos,
    setCurrentIndex,
    toggleMute,
    setHasLiked,
  } = useShortsStore();

  // Fetch videos with this short as the initial one - only once
  useEffect(() => {
    if (uuid && !isLoading) {
      fetchVideos(uuid);
    }
  }, [uuid, fetchVideos, isLoading]);

  // Mark as ready once we have videos
  useEffect(() => {
    if (videos.length > 0 && !isReady) {
      const timer = setTimeout(() => {
        setIsReady(true);
        isInitializedRef.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [videos.length, isReady]);

  // URL sync - only update after initialization
  useEffect(() => {
    if (!isInitializedRef.current || !isReady) return;

    const currentVideo = videos[currentIndex];
    if (currentVideo && currentVideo.uuid !== uuid) {
      router.replace(`/shorts/${currentVideo.uuid}`, { scroll: false });
    }
  }, [currentIndex, videos, router, uuid, isReady]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isReady) return;

      // M for mute toggle
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
        return;
      }

      // L for like toggle
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        const currentVideo = videos[currentIndex];
        if (currentVideo) {
          videosApi
            .toggleLike(currentVideo.uuid)
            .then(() => {
              setHasLiked(!hasLiked);
            })
            .catch(() => {
              toast.error('Please login to like');
            });
        }
        return;
      }

      // Up/Down arrows and j/k for navigation
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        swiperRef.current?.slideNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        swiperRef.current?.slidePrev();
      } else if (e.key === 'Escape') {
        router.push('/shorts');
      }
    },
    [toggleMute, videos, currentIndex, hasLiked, setHasLiked, router, isReady]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle slide change - with guard
  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      if (!isInitializedRef.current) return;
      setCurrentIndex(swiper.activeIndex);
    },
    [setCurrentIndex]
  );

  // Store swiper instance
  const handleSwiperInit = useCallback((swiper: SwiperType) => {
    swiperRef.current = swiper;
  }, []);

  // Loading state - show during initial load or while fetching
  if ((isLoading || !hasFetched) && videos.length === 0) {
    return (
      <div className="fixed top-14 left-0 right-0 bottom-0 bg-black flex items-center justify-center z-30 lg:left-[72px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-red-primary animate-spin" />
          <p className="text-white/60 text-sm">Loading short...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && videos.length === 0) {
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
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => fetchVideos(uuid)}
              className="px-6 py-2.5 bg-red-primary text-white rounded-full font-medium hover:bg-red-primary/80 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    );
  }

  // Empty state - only show after fetch attempt
  if (videos.length === 0 && hasFetched) {
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
            <p className="text-white/50 text-lg">Short not found</p>
            <button
              onClick={() => router.push('/shorts')}
              className="px-6 py-2.5 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-colors"
            >
              Browse Shorts
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="fixed top-14 left-0 right-0 bottom-0 bg-black overflow-hidden z-30 lg:left-[72px]">
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
          addSlidesAfter: 2,
          addSlidesBefore: 1,
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
        {videos.map((video, index) => (
          <SwiperSlide
            key={video.uuid}
            virtualIndex={index}
            className="!h-full !w-full"
          >
            <ShortVideoCard
              video={video}
              index={index}
              isActive={currentIndex === index}
            />
          </SwiperSlide>
        ))}
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
          disabled={currentIndex >= videos.length - 1}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all backdrop-blur-sm border border-white/10"
          aria-label="Next short"
        >
          <ChevronDown className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-4 left-4 text-white/30 text-xs hidden md:block">
        <span className="mr-4">↑↓ Navigate</span>
        <span className="mr-4">M Mute</span>
        <span className="mr-4">L Like</span>
        <span>Esc Back</span>
      </div>

      {/* Loading indicator for fetching more */}
      {isLoadingMore && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
