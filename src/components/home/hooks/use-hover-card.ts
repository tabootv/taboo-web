/**
 * Hook for managing hover card expansion and video playback logic
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { HOVER_DELAY, VIDEO_PREVIEW_DELAY } from '@/components/home/constants/home-constants';

interface UseHoverCardOptions {
  onExpand?: () => void;
  onCollapse?: () => void;
  onVideoPlay?: () => void;
  onVideoPause?: () => void;
}

/**
 * Hook for managing hover card state and video playback
 */
export function useHoverCard(options?: UseHoverCardOptions) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleMouseEnter = useCallback(() => {
    // Clear any existing timeout first to prevent overlapping hovers
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    setIsHovered(true);

    // Delay before expanding and playing video
    hoverTimeoutRef.current = setTimeout(() => {
      setIsExpanded(true);
      options?.onExpand?.();

      // Start playing video after expansion
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().then(() => {
          setIsVideoPlaying(true);
          options?.onVideoPlay?.();
        }).catch(() => {
          // Video play failed, stay on thumbnail
        });
      }
    }, HOVER_DELAY);
  }, [options]);

  const handleMouseLeave = useCallback(() => {
    // Immediately clear the timeout to prevent delayed expansion
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    setIsHovered(false);
    setIsExpanded(false);
    setIsVideoPlaying(false);
    setIsVideoReady(false);
    options?.onCollapse?.();

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      options?.onVideoPause?.();
    }
  }, [options]);

  const handleVideoLoaded = useCallback(() => {
    setIsVideoReady(true);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Only show expanded state when BOTH conditions are true
  // This prevents multiple cards from appearing expanded when moving mouse quickly
  const showExpanded = isExpanded && isHovered;

  return {
    isHovered,
    isExpanded,
    showExpanded,
    isVideoPlaying,
    isVideoReady,
    videoRef,
    handleMouseEnter,
    handleMouseLeave,
    handleVideoLoaded,
  };
}

