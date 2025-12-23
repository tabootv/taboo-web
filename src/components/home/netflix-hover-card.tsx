'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Plus, ChevronDown, Volume2, VolumeX, Check } from 'lucide-react';
import { useSavedVideosStore, type SavedVideo } from '@/lib/stores/saved-videos-store';
import { videos as videosApi } from '@/lib/api';
import type { Video } from '@/types';
import { formatRelativeTime, formatDuration } from '@/lib/utils';

interface NetflixHoverCardProps {
  video: Video;
  showDate?: boolean;
  index?: number;
  fixedHeight?: boolean;
}

export function NetflixHoverCard({ video, showDate, index = 0, fixedHeight = true }: NetflixHoverCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
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
    setMounted(true);
    if (video.id) {
      setSaved(isSaved(video.id));
    }
  }, [isSaved, video.id]);

  const thumbnail = video.thumbnail_webp || video.thumbnail || video.card_thumbnail;
  const isNew = video.published_at && new Date(video.published_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
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
            {/* Thumbnail - Fixed aspect ratio for uniform height */}
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

              {/* Video Preview */}
              {previewUrl && (
                <video
                  ref={videoRef}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    isVideoPlaying && isVideoReady ? 'opacity-100' : 'opacity-0'
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

              {/* NEW tag */}
              {isNew && !showExpanded && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-primary text-white text-[10px] font-bold rounded">
                  NEW
                </div>
              )}

              {/* Duration badge */}
              {video.duration && !showExpanded && (
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-[10px] rounded">
                  {formatDuration(video.duration)}
                </div>
              )}

              {/* Play overlay for non-expanded state */}
              {!showExpanded && isHovered && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity">
                  <div className="p-3 bg-red-primary/90 rounded-full transform scale-100 hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-white" fill="white" />
                  </div>
                </div>
              )}

              {/* Volume control when video is playing */}
              {showExpanded && isVideoPlaying && previewUrl && (
                <button
                  onClick={toggleMute}
                  className="absolute bottom-2 right-2 p-1.5 rounded-full bg-surface/80 border border-white/30 hover:border-white transition-colors z-10"
                >
                  {isMuted ? (
                    <VolumeX className="w-3 h-3 text-white" />
                  ) : (
                    <Volume2 className="w-3 h-3 text-white" />
                  )}
                </button>
              )}

              {/* Gradient overlay when expanded */}
              {showExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
              )}
            </div>
          </div>

          {/* Expanded Info Panel - Netflix Style with Description */}
          {showExpanded && (
            <div className="netflix-card-info bg-surface rounded-b-lg p-3 shadow-lg border-t-0">
              {/* Action buttons */}
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={handlePlay}
                  className="netflix-action-btn-primary p-2 rounded-full bg-white hover:bg-white/90 transition-all hover:scale-110"
                  title="Play"
                >
                  <Play className="w-4 h-4 text-black" fill="black" />
                </button>
                <button
                  onClick={handleSave}
                  className={`netflix-action-btn p-2 rounded-full border transition-all hover:scale-110 ${
                    saved
                      ? 'bg-white/20 border-white text-white'
                      : 'bg-surface/80 border-white/40 hover:border-white text-white'
                  }`}
                  title={saved ? 'Remove from My List' : 'Add to My List'}
                >
                  {saved ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={toggleDescription}
                  className={`netflix-action-btn p-2 rounded-full border transition-all hover:scale-110 ml-auto ${
                    showFullDescription
                      ? 'bg-white/20 border-white'
                      : 'bg-surface/80 border-white/40 hover:border-white'
                  }`}
                  title="More Info"
                >
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${showFullDescription ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Video meta info */}
              <div className="flex items-center gap-2 text-[10px] mb-1.5 flex-wrap">
                {isNew && (
                  <span className="text-green-400 font-semibold">New</span>
                )}
                {video.duration && (
                  <span className="text-white/70">{formatDuration(video.duration)}</span>
                )}
                {video.views_count !== undefined && (
                  <span className="text-white/70">{video.views_count.toLocaleString()} views</span>
                )}
                {video.likes_count !== undefined && video.likes_count > 0 && (
                  <span className="text-red-400">♥ {video.likes_count.toLocaleString()}</span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-white text-[12px] line-clamp-1 mb-1">
                {video.title}
              </h3>

              {/* Description - Netflix Style */}
              <p className={`text-[10px] text-white/70 leading-relaxed mb-2 transition-all duration-200 ${
                showFullDescription ? 'line-clamp-none max-h-24 overflow-y-auto' : 'line-clamp-2'
              }`}>
                {description}
              </p>

              {/* Channel info */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-white/10">
                {video.channel?.dp ? (
                  <div className="relative w-4 h-4 rounded-full overflow-hidden ring-1 ring-white/20">
                    <Image src={video.channel.dp} alt="" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold">
                      {video.channel?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                <p className="text-[10px] text-white/60 truncate flex-1">
                  {video.channel?.name}
                </p>
              </div>

              {/* Tags if available */}
              {video.tags && video.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {video.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id || tag.name}
                      className="text-[9px] px-1.5 py-0.5 bg-white/10 rounded text-white/60"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </Link>
      </div>

      {/* Non-expanded info (always visible when not expanded) */}
      {!showExpanded && (
        <div className="mt-2">
          <h3 className="font-medium text-text-primary text-sm line-clamp-2 group-hover:text-red-primary transition-colors">
            {video.title}
          </h3>
          {showDate && video.published_at && (
            <p className="text-xs text-text-secondary mt-1">
              {formatRelativeTime(video.published_at)}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {video.channel?.dp ? (
              <div className="relative w-4 h-4 rounded-full overflow-hidden">
                <Image src={video.channel.dp} alt="" fill className="object-cover" />
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-primary/80 to-red-dark flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">
                  {video.channel?.name?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <p className="text-xs text-text-secondary truncate">
              {video.channel?.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
