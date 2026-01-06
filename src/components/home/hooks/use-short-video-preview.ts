/**
 * Hook for managing short video preview playback
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { shortsClient } from '@/api/client';
import { getVideoUrl } from '../utils/shorts-utils';
import { HOVER_DELAY, VIDEO_PREVIEW_DELAY } from '../constants/home-constants';
import type { Video } from '@/types';

export function useShortVideoPreview(video: Video) {
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
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    setIsHovered(true);

    // If no preview URL available, fetch it from the API
    if (!initialPreviewUrl && !fetchedPreviewUrl && !isFetchingUrl) {
      setIsFetchingUrl(true);
      try {
        const fullShort = await shortsClient.getV2(video.uuid);
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
    }, HOVER_DELAY);
  }, [initialPreviewUrl, fetchedPreviewUrl, isFetchingUrl, video.uuid]);

  const handleMouseLeave = useCallback(() => {
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
    setIsMuted((prev) => {
      if (videoRef.current) {
        videoRef.current.muted = !prev;
      }
      return !prev;
    });
  }, []);

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
      }, VIDEO_PREVIEW_DELAY);
    }
  }, [fetchedPreviewUrl, isHovered, isVideoPlaying]);

  const showVideo = isVideoPlaying && isVideoReady;

  return {
    thumbnail,
    previewUrl,
    isHovered,
    isVideoReady,
    isVideoPlaying,
    isMuted,
    isFetchingUrl,
    showVideo,
    videoRef,
    handleMouseEnter,
    handleMouseLeave,
    handleVideoLoaded,
    toggleMute,
  };
}

