'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Play } from 'lucide-react';
import { home, shorts } from '@/lib/api';
import type { Video } from '@/types';
import { SectionCard } from './section-card';

// Fisher-Yates shuffle for random order
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get best available video URL from a video object
function getVideoUrl(video: Video | undefined | null): string | null {
  if (!video) return null;
  return video.url_480 || video.url_720 || video.url_1080 || video.url_hls || video.hls_url || null;
}

interface HomeShortsSectionProps {
  initialShorts?: Video[];
}

export function HomeShortsSection({ initialShorts }: HomeShortsSectionProps) {
  const pathname = usePathname();
  const hasInitialData = initialShorts && initialShorts.length > 0;
  const [videos, setVideos] = useState<Video[]>(
    initialShorts ? shuffleArray(initialShorts) : []
  );
  const [isLoading, setIsLoading] = useState(!hasInitialData);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);
  const didInitialFetch = useRef(false);

  useEffect(() => {
    // Skip fetch if initial data was provided and has content
    if (hasInitialData && !didInitialFetch.current) {
      didInitialFetch.current = true;
      return;
    }
    didInitialFetch.current = true;

    let cancelled = false;
    setIsLoading(true);

    async function fetchVideos() {
      try {
        const data = await home.getShortVideosV2();
        if (!cancelled) {
          // Shuffle the shorts to show random order each time
          setVideos(shuffleArray(data || []));
        }
      } catch (error) {
        console.error('Error fetching short videos:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    fetchVideos();

    return () => {
      cancelled = true;
    };
  }, [pathname, hasInitialData]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftGradient(scrollLeft > 20);
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 20);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll, videos]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return (
      <SectionCard title="Shorts" href="/shorts">
        <div className="flex gap-3 md:gap-6 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[169px] md:w-[190px] aspect-[9/16] rounded-lg bg-surface animate-pulse"
            />
          ))}
        </div>
      </SectionCard>
    );
  }

  if (videos.length === 0) return null;

  return (
    <SectionCard title="Shorts" href="/shorts">
      <div className="relative group/section">
        {/* Left Gradient */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity ${
            showLeftGradient ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Right Gradient */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity ${
            showRightGradient ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Navigation Arrows - centered on vertical shorts */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 md:p-2.5 bg-black/80 rounded-full border border-white/20 opacity-0 group-hover/section:opacity-100 transition-all hover:bg-black hover:border-white/40 ${
            showLeftGradient ? '' : 'pointer-events-none !opacity-0'
          }`}
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </button>
        <button
          onClick={() => scroll('right')}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 md:p-2.5 bg-black/80 rounded-full border border-white/20 opacity-0 group-hover/section:opacity-100 transition-all hover:bg-black hover:border-white/40 ${
            showRightGradient ? '' : 'pointer-events-none !opacity-0'
          }`}
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </button>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-6 overflow-x-auto pb-4 hide-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {videos.map((video, index) => (
            <ShortCard key={video.uuid} video={video} index={index} />
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

// Individual Short Card with video preview
interface ShortCardProps {
  video: Video;
  index: number;
}

function ShortCard({ video, index }: ShortCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [fetchedPreviewUrl, setFetchedPreviewUrl] = useState<string | null>(null);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const thumbnail = video.thumbnail || video.thumbnail_webp || video.card_thumbnail;
  const initialPreviewUrl = getVideoUrl(video);
  const previewUrl = initialPreviewUrl || fetchedPreviewUrl;

  const handleMouseEnter = useCallback(async () => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    setIsHovered(true);

    // If no preview URL available, fetch it from the API
    if (!initialPreviewUrl && !fetchedPreviewUrl && !isFetchingUrl) {
      setIsFetchingUrl(true);
      try {
        const fullShort = await shorts.getV2(video.uuid);
        const url = getVideoUrl(fullShort);
        if (url) {
          setFetchedPreviewUrl(url);
        }
      } catch (error) {
        console.error('Failed to fetch short preview URL:', error);
      } finally {
        setIsFetchingUrl(false);
      }
    }

    // Delay before playing video (like Netflix)
    hoverTimeoutRef.current = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().then(() => {
          setIsVideoPlaying(true);
        }).catch(() => {
          // Video play failed
        });
      }
    }, 300);
  }, [initialPreviewUrl, fetchedPreviewUrl, isFetchingUrl, video.uuid]);

  const handleMouseLeave = useCallback(() => {
    // Clear timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    setIsHovered(false);
    setIsVideoPlaying(false);
    setIsVideoReady(false);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  const handleVideoLoaded = useCallback(() => {
    setIsVideoReady(true);
  }, []);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Play video when fetchedPreviewUrl becomes available and card is hovered
  useEffect(() => {
    if (fetchedPreviewUrl && isHovered && videoRef.current && !isVideoPlaying) {
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().then(() => {
            setIsVideoPlaying(true);
          }).catch(() => {
            // Video play failed
          });
        }
      }, 100);
    }
  }, [fetchedPreviewUrl, isHovered, isVideoPlaying]);

  const showVideo = isVideoPlaying && isVideoReady;

  return (
    <Link
      href={`/shorts/${video.uuid}`}
      className="flex-shrink-0 w-[169px] md:w-[190px] group relative rounded-lg overflow-hidden cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-[9/16]">
        {/* Thumbnail */}
        {thumbnail && (
          <Image
            src={thumbnail}
            alt={video.title || 'Short video'}
            fill
            className={`object-cover transition-opacity duration-300 ${
              showVideo ? 'opacity-0' : 'opacity-100'
            }`}
            priority={index < 6}
          />
        )}

        {/* Video preview on hover */}
        {previewUrl && (
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              showVideo ? 'opacity-100' : 'opacity-0'
            }`}
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            onLoadedData={handleVideoLoaded}
          >
            <source src={previewUrl} type="video/mp4" />
          </video>
        )}

        {/* Loading indicator while fetching video URL */}
        {isHovered && isFetchingUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Play icon overlay when hovered but video not playing yet */}
        {isHovered && !showVideo && !isFetchingUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="p-3 bg-white/90 rounded-full">
              <Play className="w-5 h-5 text-black" fill="black" />
            </div>
          </div>
        )}

        {/* Volume control when video is playing */}
        {showVideo && (
          <button
            onClick={toggleMute}
            className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 border border-white/30 hover:border-white transition-colors z-10"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </button>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Border on hover */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ring-2 ring-red-primary/60" />
      </div>
    </Link>
  );
}
