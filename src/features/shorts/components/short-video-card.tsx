'use client';

import { useRef, useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Volume2,
  VolumeX,
  Play,
} from 'lucide-react';
import { useShortsStore } from '@/lib/stores/shorts-store';
import { videos as videosApi } from '@/lib/api';
import { formatCompactNumber } from '@/lib/utils';
import { toast } from 'sonner';
import type { Video } from '@/types';
import { usePrefersReducedMotion } from '@/lib/hooks';

interface ShortVideoCardProps {
  video: Video;
  index: number;
  isActive: boolean;
  isNearActive?: boolean; // True for slides adjacent to active (for preloading)
}

// Detect if we're on a desktop/high-bandwidth device
const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;

function ShortVideoCardComponent({ video, index: _index, isActive, isNearActive = false }: ShortVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const shouldPlayRef = useRef(false); // Track if video should be playing
  const isMutedRef = useRef(false); // Track mute state without causing re-renders
  const hasStartedPlaybackRef = useRef(false); // Avoid unmuting before autoplay is allowed

  const [, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [heartPosition, setHeartPosition] = useState({ x: 0, y: 0 });
  const lastProgressUpdate = useRef<number>(0);

  const {
    isMuted,
    toggleMute,
    hasLiked,
    setHasLiked,
  } = useShortsStore();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Keep ref in sync with store value
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Better video source selection: prefer higher quality on desktop
  const videoSrc = isDesktop
    ? (video.url_720 || video.url_1080 || video.url_480 || video.hls_url || '')
    : (video.url_480 || video.url_720 || video.hls_url || '');
  const likesCount = video.likes_count ?? 0;

  // Determine preload strategy based on active/near-active state
  const preloadStrategy = isActive && !prefersReducedMotion
    ? 'auto'
    : isNearActive
      ? 'metadata'
      : 'none';

  // Helper to attempt playback
  const attemptPlay = useCallback(async () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    // Start muted to satisfy autoplay, then unmute immediately if the user prefers sound
    videoEl.muted = true;
    videoEl.volume = 0;
    try {
      await videoEl.play();
      hasStartedPlaybackRef.current = true;
      setIsPlaying(true);
      if (!isMutedRef.current) {
        videoEl.muted = false;
        videoEl.volume = 1;
      }
    } catch {
      // Autoplay blocked - user will need to tap
    }
  }, []);

  // Video event handlers as callbacks for React props
  const handleCanPlay = useCallback(() => {
    if (isActive && !prefersReducedMotion) {
      void attemptPlay();
    }
  }, [isActive, prefersReducedMotion, attemptPlay]);

  const handleLoadedData = useCallback(() => {
    if (isActive && !prefersReducedMotion) {
      void attemptPlay();
    }
  }, [isActive, prefersReducedMotion, attemptPlay]);

  // Play/pause based on active state
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (isActive && !prefersReducedMotion) {
      shouldPlayRef.current = true;
      hasStartedPlaybackRef.current = false;
      videoEl.currentTime = 0;
      // Try to play immediately
      void attemptPlay();
    } else {
      shouldPlayRef.current = false;
      hasStartedPlaybackRef.current = false;
      videoEl.pause();
      setIsPlaying(false);
      if (!isActive) {
        videoEl.currentTime = 0;
      }
    }
  }, [isActive, prefersReducedMotion, attemptPlay]);

  // Update mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted || !hasStartedPlaybackRef.current;
      videoRef.current.volume = videoRef.current.muted ? 0 : 1;
    }
  }, [isMuted]);

  // Progress tracking
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    // Throttled progress update - only update every 250ms to reduce re-renders
    const handleTimeUpdate = () => {
      const now = Date.now();
      if (now - lastProgressUpdate.current < 250) return;
      lastProgressUpdate.current = now;

      if (videoEl.duration) {
        setProgress((videoEl.currentTime / videoEl.duration) * 100);
      }
    };

    const handlePlaying = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    videoEl.addEventListener('timeupdate', handleTimeUpdate);
    videoEl.addEventListener('playing', handlePlaying);
    videoEl.addEventListener('pause', handlePause);

    return () => {
      videoEl.removeEventListener('timeupdate', handleTimeUpdate);
      videoEl.removeEventListener('playing', handlePlaying);
      videoEl.removeEventListener('pause', handlePause);
    };
  }, []);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (videoEl.paused) {
      videoEl.play();
      setShowPlayIcon(false);
    } else {
      videoEl.pause();
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 800);
    }
  }, []);

  // Double tap to like
  const handleVideoTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Double tap - like
      if (!prefersReducedMotion) {
        const rect = e.currentTarget.getBoundingClientRect();
        setHeartPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 1000);
      }

      if (!hasLiked) {
        handleToggleLike();
      }
    } else {
      // Single tap - toggle play
      togglePlay();
    }

    lastTapRef.current = now;
  }, [hasLiked, togglePlay]);

  // Seek on progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  const handleToggleLike = async () => {
    try {
      await videosApi.toggleLike(video.uuid);
      setHasLiked(!hasLiked);
    } catch {
      toast.error('Please login to like');
    }
  };

  return (
    <div className="relative h-full w-full flex items-center justify-center bg-black shorts-slide-content">
      {/* Video Container - Full screen on mobile, centered on desktop */}
      <div className="relative h-full w-full md:max-h-full md:aspect-[9/16] md:w-auto shorts-video-wrapper">
        {/* Video */}
        <div
          className="relative h-full w-full cursor-pointer"
          onClick={handleVideoTap}
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            preload={preloadStrategy}
            loop
            autoPlay={isActive && !prefersReducedMotion}
            playsInline
            muted
            poster={video.thumbnail}
            onCanPlay={handleCanPlay}
            onLoadedData={handleLoadedData}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>

          {/* Play icon on pause */}
          {showPlayIcon && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 rounded-full bg-black/40 flex items-center justify-center animate-scale-in">
                <Play className="w-10 h-10 text-white fill-white ml-1" />
              </div>
            </div>
          )}

          {/* Double-tap heart animation */}
          {showHeartAnimation && (
            <div
              className="absolute pointer-events-none z-50"
              style={{ left: heartPosition.x - 50, top: heartPosition.y - 50 }}
            >
              <Heart
                className="w-[100px] h-[100px] text-red-500 fill-red-500 animate-heart-pop"
              />
            </div>
          )}
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

        {/* Top gradient for status bar area */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none md:hidden" />

        {/* Progress bar */}
        <div
          ref={progressRef}
          className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 cursor-pointer z-20"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Top right controls */}
        <div className="absolute right-4 top-16 md:top-4 flex items-center gap-3 z-20">
          {/* Like button */}
          <ActionButton
            icon={Heart}
            count={likesCount + (hasLiked ? 1 : 0)}
            isActive={hasLiked}
            activeColor="text-red-500"
            onClick={handleToggleLike}
            filled={hasLiked}
          />

          {/* Volume button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-6 left-4 right-20 z-10 shorts-info-animated">
          {/* Channel info with avatar */}
          <Link
            href={`/creators/creator-profile/${video.channel?.id}`}
            className="inline-flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/50 flex-shrink-0">
              {video.channel?.dp ? (
                <Image
                  src={video.channel.dp}
                  alt={video.channel.name || 'Channel'}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {video.channel?.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>
            <span className="font-bold text-white text-base group-hover:underline">
              @{video.channel?.name || 'unknown'}
            </span>
          </Link>

          {/* Caption */}
          <p className="text-white text-sm mt-2 line-clamp-2 leading-relaxed">
            {video.title}
          </p>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {video.tags
                .filter((tag) => tag.should_show)
                .slice(0, 4)
                .map((tag) => (
                  <span key={tag.id} className="text-white/80 text-sm">
                    #{tag.name}
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Action button component
interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  isActive?: boolean;
  activeColor?: string;
  onClick: () => void;
  filled?: boolean;
}

function ActionButton({
  icon: Icon,
  count,
  isActive,
  activeColor = 'text-white',
  onClick,
  filled,
}: ActionButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors group"
    >
      <Icon
        className={`
          w-5 h-5 transition-colors
          ${isActive ? activeColor : 'text-white'}
          ${filled ? 'fill-current' : ''}
        `}
      />
      {count !== undefined && (
        <span className="text-white text-xs font-medium">
          {formatCompactNumber(count)}
        </span>
      )}
    </button>
  );
}

// Memoize the component to prevent unnecessary re-renders when parent updates
export const ShortVideoCard = memo(ShortVideoCardComponent, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.isNearActive === nextProps.isNearActive &&
    prevProps.video.uuid === nextProps.video.uuid &&
    prevProps.video.likes_count === nextProps.video.likes_count
  );
});
