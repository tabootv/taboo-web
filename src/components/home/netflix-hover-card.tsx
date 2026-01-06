'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSavedVideosStore, type SavedVideo } from '@/lib/stores/saved-videos-store';
import { videoClient as videosApi } from '@/api/client';
import type { Video } from '@/types';
import { Play } from 'lucide-react';
import { HoverCardVideoPreview } from './components/HoverCardVideoPreview';
import { HoverCardInfo } from './components/HoverCardInfo';
import { HoverCardActions } from './components/HoverCardActions';

interface NetflixHoverCardProps {
  video: Video;
  showDate?: boolean;
  index?: number;
  fixedHeight?: boolean;
}

export function NetflixHoverCard({ video, showDate, index = 0, fixedHeight: _fixedHeight = true }: NetflixHoverCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [fetchedPreviewUrl, setFetchedPreviewUrl] = useState<string | null>(null);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { isSaved, toggleSave } = useSavedVideosStore();
  const router = useRouter();

  // Check saved state on mount
  useEffect(() => {
    if (video.id) {
      setSaved(isSaved(video.id));
    }
  }, [isSaved, video.id]);

  const thumbnail = video.thumbnail_webp || video.thumbnail || video.card_thumbnail;
  const isNew = !!(video.published_at && new Date(video.published_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
  const description = video.description || video.title;

  // Get video URL for preview (prefer lower quality for preview, fallback to HLS or fetched URL)
  const initialPreviewUrl = video.url_480 || video.url_720 || video.url_1080 || video.url_hls || video.hls_url;
  const previewUrl = initialPreviewUrl || fetchedPreviewUrl;

  const handleMouseEnter = useCallback(async () => {
    // Clear any existing timeout first to prevent overlapping hovers
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    setIsHovered(true);

    // If no preview URL available, fetch it from the API
    if (!initialPreviewUrl && !fetchedPreviewUrl && !isFetchingUrl && video.id) {
      setIsFetchingUrl(true);
      try {
        const videoDetails = await videosApi.getVideo(video.id);
        const url = videoDetails.url_480 || videoDetails.url_720 || videoDetails.url_1080 || videoDetails.url_hls || videoDetails.hls_url;
        if (url) {
          setFetchedPreviewUrl(url);
        }
      } catch (error) {
        console.error('Failed to fetch video preview URL:', error);
      } finally {
        setIsFetchingUrl(false);
      }
    }

    // Delay before expanding and playing video
    hoverTimeoutRef.current = setTimeout(() => {
      setIsExpanded(true);

      // Start playing video after expansion
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().then(() => {
          setIsVideoPlaying(true);
        }).catch(() => {
          // Video play failed, stay on thumbnail
        });
      }
    }, 400);
  }, [initialPreviewUrl, fetchedPreviewUrl, isFetchingUrl, video.id]);

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
    setShowFullDescription(false);

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

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!video.id) return;

    const savedVideo: SavedVideo = {
      id: video.id,
      title: video.title,
      thumbnail: video.thumbnail_webp || video.thumbnail || null,
      channelName: video.channel?.name || null,
      savedAt: Date.now(),
    };
    const newState = toggleSave(savedVideo);
    setSaved(newState);
  }, [video, toggleSave]);

  const toggleDescription = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowFullDescription(!showFullDescription);
  }, [showFullDescription]);

  const handlePlay = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/videos/${video.id}`);
  }, [router, video.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Preload video on mount or when URL becomes available
  useEffect(() => {
    if (videoRef.current && previewUrl) {
      videoRef.current.load();
    }
  }, [previewUrl]);

  // Play video when fetchedPreviewUrl becomes available and card is expanded AND hovered
  useEffect(() => {
    if (fetchedPreviewUrl && isExpanded && isHovered && videoRef.current && !isVideoPlaying) {
      // Small delay to allow video element to render
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
  }, [fetchedPreviewUrl, isExpanded, isHovered, isVideoPlaying]);

  // Calculate position offset for edge cards
  const getTransformOrigin = () => {
    if (index === 0) return 'left center';
    if (index >= 4) return 'right center';
    return 'center center';
  };

  // Only show expanded state when BOTH conditions are true
  // This prevents multiple cards from appearing expanded when moving mouse quickly
  const showExpanded = isExpanded && isHovered;

  return (
    <div
      ref={cardRef}
      className="netflix-card-wrapper flex-shrink-0 w-[200px] md:w-[280px] relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ zIndex: showExpanded ? 100 : 1 }}
    >
      <div
        className={`netflix-card relative transition-all duration-300 ease-out ${
          showExpanded ? 'netflix-card-expanded' : ''
        }`}
        style={{
          transformOrigin: getTransformOrigin(),
          transform: showExpanded ? 'scale(1.4)' : 'scale(1)',
        }}
      >
        <Link href={`/videos/${video.id}`} className="block">
          {/* Main Card */}
          <div className={`relative rounded-lg overflow-hidden bg-surface ${showExpanded ? 'rounded-b-none' : ''}`}>
            <div className="relative aspect-video">
              {thumbnail && !imageError ? (
                <Image
                  src={thumbnail}
                  alt={video.title}
                  fill
                  className={`object-cover transition-opacity duration-300 ${
                    isVideoPlaying && isVideoReady ? 'opacity-0' : 'opacity-100'
                  }`}
                  sizes="(max-width: 768px) 200px, 280px"
                  priority={index < 4}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-hover flex items-center justify-center">
                  <Play className="w-12 h-12 text-white/30" />
                </div>
              )}

              <HoverCardVideoPreview
                previewUrl={previewUrl}
                isVideoPlaying={isVideoPlaying}
                isVideoReady={isVideoReady}
                isMuted={isMuted}
                isExpanded={showExpanded}
                isHovered={isHovered}
                isNew={isNew}
                duration={video.duration || null}
                videoRef={videoRef}
                onVideoLoaded={handleVideoLoaded}
                onToggleMute={toggleMute}
              />
            </div>
          </div>

          {/* Expanded Info Panel - Netflix Style with Description */}
          {showExpanded && (
            <HoverCardInfo
              video={video}
              isNew={isNew}
              description={description}
              saved={saved}
              showFullDescription={showFullDescription}
              onPlay={handlePlay}
              onSave={handleSave}
              onToggleDescription={toggleDescription}
            />
          )}
        </Link>
      </div>

      {/* Non-expanded info (always visible when not expanded) */}
      {!showExpanded && <HoverCardActions video={video} showDate={showDate} />}
    </div>
  );
}
