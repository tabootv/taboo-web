'use client';

import { homeClient } from '@/api/client/home.client';
import { Button } from '@/components/ui/button';
import { useCreatorById } from '@/hooks/use-creator-by-id';
import { getSeriesRoute } from '@/lib/utils';
import type { Banner } from '@/types';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface BannerSliderProps {
  initialBanners?: Banner[];
}

export function BannerSlider({ initialBanners }: BannerSliderProps) {
  const hasInitialData = initialBanners && initialBanners.length > 0;
  const [banners, setBanners] = useState<Banner[]>(initialBanners || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(!hasInitialData);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialBanners && initialBanners.length > 0) return;

    async function fetchBanners() {
      try {
        const data = await homeClient.getBanners();
        setBanners(data || []);
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBanners();
  }, [initialBanners]);

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

  const currentBanner = banners[currentIndex];
  const creator = useCreatorById(currentBanner?.channel.name);
  const creatorImage = creator?.dp;

  if (isLoading) {
    return (
      <div className="w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.35/1] bg-black animate-pulse">
        <div className="h-full w-full flex flex-col justify-end items-start p-6 md:p-12 lg:p-16 pb-20">
          <div className="w-48 h-6 bg-surface rounded mb-4" />
          <div className="w-96 h-12 bg-surface rounded mb-4" />
          <div className="w-64 h-4 bg-surface rounded mb-6" />
          <div className="w-40 h-12 bg-surface rounded-full" />
        </div>
      </div>
    );
  }

  if (banners.length === 0 || !currentBanner) {
    return null;
  }

  const thumbnail =
    currentBanner.type === 'video' ? currentBanner.thumbnail : currentBanner.trailer_thumbnail;

  const href =
    currentBanner.type === 'series' ? getSeriesRoute(currentBanner.id, currentBanner.title) : `/videos/${currentBanner.id}`;

  return (
    <div className="relative w-full overflow-hidden group">
      <div
        className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.35/1] transition-all duration-500"
        style={{
          backgroundImage: `url(${thumbnail})`,
          backgroundPosition: 'top',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end sm:justify-center items-start px-[4%] pb-16 sm:pb-20 md:pb-24">
          <div className="text-left backdrop-blur-md sm:backdrop-blur-none rounded-lg p-3 sm:p-4 md:p-0 max-w-[90%] sm:max-w-[600px]">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              {creatorImage ? (
                <div className="relative size-6 rounded-full overflow-hidden">
                  <Image
                    src={creatorImage}
                    alt={currentBanner.channel?.name || 'Creator'}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-linear-to-br from-red-primary to-red-dark flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {(currentBanner.channel?.name || 'C').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-white/80 drop-shadow-lg">
                {currentBanner.channel?.name}
              </h3>
            </div>

            <h2 className="text-[1.5vw] font-bold text-white mb-2 sm:mb-3 drop-shadow-lg line-clamp-2">
              {currentBanner.title}
            </h2>

            {currentBanner.description && (
              <div className="hidden sm:block text-xs md:text-sm text-white/80 drop-shadow-lg mb-3 md:mb-5">
                <p className="text-[1.2vw] line-clamp-3">{currentBanner.description}</p>
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

            <Link href={href}>
              <Button
                size="lg"
                className="btn-premium text-sm sm:text-base lg:text-xl font-semibold"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="white" />
                Play Now
              </Button>
            </Link>
          </div>
        </div>

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
}
