'use client';

import { useToggleShortLike } from '@/api/mutations/shorts.mutations';
import { usePrefersReducedMotion } from '@/hooks';
import { useShortsStore } from '@/shared/stores/shorts-store';
import type { Video } from '@/types';
import { Heart, Play, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface ShortVideoPlayerProps {
  video: Video;
  isActive: boolean;
  isNearActive?: boolean;
}

// Detect if we're on a desktop/high-bandwidth device
const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;

export function ShortVideoPlayer({ video, isActive, isNearActive = false }: ShortVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const shouldPlayRef = useRef(false);
  const isMutedRef = useRef(false);
  const hasStartedPlaybackRef = useRef(false);
  const lastProgressUpdate = useRef<number>(0);

  const [progress, setProgress] = useState(0);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [heartPosition, setHeartPosition] = useState({ x: 0, y: 0 });

  const { isMuted, toggleMute } = useShortsStore();
  const prefersReducedMotion = usePrefersReducedMotion();
  const toggleLike = useToggleShortLike();

  // Get like state from video prop (managed by React Query)
  const hasLiked = video.has_liked ?? false;

  // Keep ref in sync with store value
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Better video source selection: prefer higher quality on desktop
  const videoSrc = isDesktop
    ? video.url_720 || video.url_1080 || video.url_480 || video.hls_url || ''
    : video.url_480 || video.url_720 || video.hls_url || '';

  // Determine preload strategy based on active/near-active state
  const preloadStrategy =
    isActive && !prefersReducedMotion ? 'auto' : isNearActive ? 'metadata' : 'none';

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
      if (!isMutedRef.current) {
        videoEl.muted = false;
        videoEl.volume = 1;
      }
    } catch {
      // Autoplay blocked - user will need to tap
    }
  }, []);

  // Video event handlers
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
      void attemptPlay();
    } else {
      shouldPlayRef.current = false;
      hasStartedPlaybackRef.current = false;
      videoEl.pause();
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

    const handleTimeUpdate = () => {
      const now = Date.now();
      if (now - lastProgressUpdate.current < 250) return;
      lastProgressUpdate.current = now;

      if (videoEl.duration) {
        setProgress((videoEl.currentTime / videoEl.duration) * 100);
      }
    };

    videoEl.addEventListener('timeupdate', handleTimeUpdate);
    return () => videoEl.removeEventListener('timeupdate', handleTimeUpdate);
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

  // Toggle like using mutation
  const handleToggleLike = useCallback(() => {
    toggleLike.mutate(video.uuid, {
      onError: () => {
        toast.error('Please login to like');
      },
    });
  }, [toggleLike, video.uuid]);

  // Double tap to like
  const handleVideoTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
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
    },
    [hasLiked, togglePlay, prefersReducedMotion, handleToggleLike]
  );

  // Seek on progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  return (
    <>
      {/* Video container */}
      <div className="short-video-container cursor-pointer" onClick={handleVideoTap}>
        <video
          ref={videoRef}
          className="short-video"
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
          <div className="short-play-icon-overlay">
            <div className="short-play-icon">
              <Play className="w-10 h-10 text-white fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Double-tap heart animation */}
        {showHeartAnimation && (
          <div
            className="short-heart-animation"
            style={{ left: heartPosition.x - 50, top: heartPosition.y - 50 }}
          >
            <Heart className="w-[100px] h-[100px] text-red-500 fill-red-500 animate-heart-pop" />
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div ref={progressRef} className="short-progress-bar" onClick={handleProgressClick}>
        <div className="short-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Top right controls */}
      <div className="short-top-controls">
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
    </>
  );
}
