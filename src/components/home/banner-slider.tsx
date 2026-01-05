'use client';

import { memo, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { home } from '@/lib/api';
import type { Banner } from '@/types';
import { Button } from '@/components/ui';

interface BannerSliderProps {
  initialBanners?: Banner[];
}

export const BannerSlider = memo(function BannerSlider({ initialBanners }: BannerSliderProps) {
  const hasInitialData = initialBanners && initialBanners.length > 0;
  const [banners, setBanners] = useState<Banner[]>(initialBanners || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(!hasInitialData);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    // Skip fetch if initial data was provided and has content
    if (initialBanners && initialBanners.length > 0) return;

    async function fetchBanners() {
      try {
        const data = await home.getBanners();
        setBanners(data || []);
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBanners();
  }, [initialBanners]);

  // Auto-rotate banners every 4 seconds
  useEffect(() => {
    if (banners.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    // Reset autoplay timer
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 4000);
    }
  };

  const goToPrev = () => {
    goToSlide(currentIndex === 0 ? banners.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    goToSlide((currentIndex + 1) % banners.length);
  };

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) touchStartX.current = touch.clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) touchEndX.current = touch.clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // Minimum swipe distance in pixels

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swiped left - go to next
        goToNext();
      } else {
        // Swiped right - go to previous
        goToPrev();
      }
    }

    // Reset
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (isLoading) {
    return (
      <div className="w-full aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.35/1] bg-black animate-pulse">
        <div className="h-full w-full flex flex-col justify-end items-start p-4 sm:p-6 md:p-12 lg:p-16 pb-12 sm:pb-20">
          <div className="w-24 sm:w-48 h-4 sm:h-6 bg-surface rounded mb-2 sm:mb-4" />
          <div className="w-48 sm:w-96 h-8 sm:h-12 bg-surface rounded mb-2 sm:mb-4" />
          <div className="hidden sm:block w-64 h-4 bg-surface rounded mb-6" />
          <div className="w-28 sm:w-40 h-10 sm:h-12 bg-surface rounded-full" />
        </div>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  if (banners.length === 0 || !currentBanner) {
    return null;
  }

  const thumbnail = currentBanner.type === 'video'
    ? currentBanner.thumbnail
    : currentBanner.trailer_thumbnail;

  const href = currentBanner.type === 'series'
    ? `/series/${currentBanner.id}`
    : `/videos/${currentBanner.id}`;

  return (
    <div
      className="relative w-full overflow-hidden group touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Banner */}
      <div
        className="relative w-full aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.35/1] transition-all duration-500"
        style={{
          backgroundImage: `url(${thumbnail})`,
          backgroundPosition: 'center top',
          backgroundSize: 'cover',
        }}
      >
        {/* Gradient overlays - lighter on mobile */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 sm:from-black/80 via-transparent sm:via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 sm:via-transparent to-transparent" />

        {/* Content - bottom aligned on mobile, left-center on desktop */}
        <div className="absolute inset-0 flex flex-col justify-end items-start sm:items-start sm:justify-center p-4 pb-12 sm:p-6 md:p-12 lg:p-20 lg:pl-24">
          <div className="text-left w-full sm:max-w-[600px]">
            {/* Channel name */}
            <h3 className="text-[10px] sm:text-sm md:text-base font-semibold text-white/90 mb-0.5 sm:mb-2 drop-shadow-lg">
              {currentBanner.channel?.name}
            </h3>

            {/* Title */}
            <h2 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg line-clamp-2">
              {currentBanner.title}
            </h2>

            {/* Description - hidden on mobile */}
            {currentBanner.description && (
              <div className="hidden sm:block text-xs md:text-sm text-white/80 drop-shadow-lg mb-3 md:mb-5">
                <p className="line-clamp-3">{currentBanner.description}</p>
                {currentBanner.description.length > 180 && (
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1 text-white font-semibold mt-2 hover:text-red-primary transition-colors"
                  >
                    Read more
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}

            {/* CTA Button */}
            <Link href={href}>
              <Button className="btn-premium px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-base font-semibold">
                <Play className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="white" />
                Play Now
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Arrows - Hidden on mobile, shown on hover for desktop */}
        {banners.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-all hidden sm:flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-all hidden sm:flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </>
        )}

        {/* Slide Indicators - visible on mobile, bottom aligned */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 sm:gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-6 sm:w-8 bg-red-primary'
                    : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
