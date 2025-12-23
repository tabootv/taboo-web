'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  X,
  Play,
  Plus,
  Check,
  Volume2,
  VolumeX,
  Clock,
  Eye,
  Heart,
  ChevronDown,
} from 'lucide-react';
import { useSavedVideosStore, type SavedVideo } from '@/lib/stores/saved-videos-store';
import { formatDuration, formatCompactNumber, formatRelativeTime } from '@/lib/utils';
import type { Video } from '@/types';

interface MediaPreviewModalProps {
  video: Video | null;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export function MediaPreviewModal({ video, onClose, triggerRef }: MediaPreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [saved, setSaved] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { isSaved, toggleSave } = useSavedVideosStore();
  const router = useRouter();

  // Mount portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Check saved state
  useEffect(() => {
    if (video?.id) {
      setSaved(isSaved(video.id));
    }
  }, [video?.id, isSaved]);

  // Lock body scroll, trap focus, handle ESC
  useEffect(() => {
    if (!video) return;

    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    // Focus modal
    setTimeout(() => {
      modalRef.current?.focus();
    }, 50);

    // Handle ESC key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
      // Trap focus
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus
      previousFocusRef.current?.focus();
    };
  }, [video]);

  // Start video playback
  useEffect(() => {
    if (!video || !videoRef.current) return;

    const timer = setTimeout(() => {
      videoRef.current?.play().then(() => {
        setIsVideoPlaying(true);
      }).catch(() => {
        // Autoplay blocked
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [video]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  }, [onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  const handlePlay = useCallback(() => {
    if (video) {
      router.push(`/videos/${video.uuid || video.id}`);
    }
  }, [router, video]);

  const handleSave = useCallback(() => {
    if (!video?.id) return;
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

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (videoRef.current) {
        videoRef.current.muted = !prev;
      }
      return !prev;
    });
  }, []);

  if (!mounted || !video) return null;

  const previewUrl = video.url_480 || video.url_720 || video.url_1080 || video.url_hls || video.hls_url;
  const thumbnail = video.thumbnail_webp || video.thumbnail || video.card_thumbnail;
  const isNew = video.published_at && new Date(video.published_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
  const description = video.description || '';

  const modalContent = (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal Card */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full max-w-[900px] max-h-[calc(100vh-48px)] bg-surface rounded-xl overflow-hidden shadow-2xl shadow-black/50 transform transition-all duration-200 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{
          width: 'min(900px, calc(100vw - 48px))',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 hover:border-white/40 transition-all group"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
        </button>

        {/* Scrollable Content */}
        <div className="max-h-[calc(100vh-48px)] overflow-y-auto custom-scrollbar">
          {/* Media Preview Area - 16:9 */}
          <div className="relative aspect-video bg-black">
            {/* Thumbnail */}
            {thumbnail && (
              <Image
                src={thumbnail}
                alt={video.title}
                fill
                className={`object-cover transition-opacity duration-500 ${
                  isVideoPlaying && isVideoReady ? 'opacity-0' : 'opacity-100'
                }`}
                priority
              />
            )}

            {/* Video Preview */}
            {previewUrl && (
              <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  isVideoPlaying && isVideoReady ? 'opacity-100' : 'opacity-0'
                }`}
                muted={isMuted}
                loop
                playsInline
                preload="auto"
                onLoadedData={() => setIsVideoReady(true)}
              >
                <source src={previewUrl} type="video/mp4" />
              </video>
            )}

            {/* Gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface via-surface/60 to-transparent" />

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              {/* Play Button */}
              <button
                onClick={handlePlay}
                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-white/90 text-black font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                <Play className="w-5 h-5 fill-black" />
                <span>Play</span>
              </button>

              {/* Volume Control */}
              {previewUrl && isVideoPlaying && (
                <button
                  onClick={toggleMute}
                  className="p-2.5 rounded-full bg-black/60 border border-white/30 hover:border-white transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
              )}
            </div>

            {/* NEW Badge */}
            {isNew && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-red-primary text-white text-xs font-bold rounded">
                NEW
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="p-6">
            {/* Title & Actions Row */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 id="modal-title" className="text-xl md:text-2xl font-bold text-white leading-tight">
                {video.title}
              </h2>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleSave}
                  className={`p-2.5 rounded-full border transition-all hover:scale-110 ${
                    saved
                      ? 'bg-white/20 border-white text-white'
                      : 'bg-surface-hover border-white/30 hover:border-white text-white'
                  }`}
                  title={saved ? 'Remove from My List' : 'Add to My List'}
                >
                  {saved ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/70 mb-4">
              {video.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {formatDuration(video.duration)}
                </span>
              )}
              {video.views_count !== undefined && (
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {formatCompactNumber(video.views_count)} views
                </span>
              )}
              {video.likes_count !== undefined && video.likes_count > 0 && (
                <span className="flex items-center gap-1.5 text-red-400">
                  <Heart className="w-4 h-4 fill-current" />
                  {formatCompactNumber(video.likes_count)}
                </span>
              )}
              {video.published_at && (
                <span className="text-white/50">
                  {formatRelativeTime(video.published_at)}
                </span>
              )}
            </div>

            {/* Channel Info */}
            {video.channel && (
              <Link
                href={`/creators/creator-profile/${video.channel.uuid || video.channel.id}`}
                className="inline-flex items-center gap-3 mb-4 group"
              >
                {video.channel.dp ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/20 group-hover:ring-red-primary/50 transition-all">
                    <Image
                      src={video.channel.dp}
                      alt={video.channel.name || 'Channel'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {video.channel.name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-white group-hover:text-red-primary transition-colors">
                    {video.channel.name}
                  </p>
                  {video.channel.subscribers_count !== undefined && (
                    <p className="text-xs text-white/50">
                      {formatCompactNumber(video.channel.subscribers_count)} subscribers
                    </p>
                  )}
                </div>
              </Link>
            )}

            {/* Description */}
            {description && (
              <div className="border-t border-white/10 pt-4">
                <p
                  className={`text-sm text-white/70 leading-relaxed transition-all ${
                    showFullDescription ? '' : 'line-clamp-3'
                  }`}
                >
                  {description}
                </p>
                {description.length > 200 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="flex items-center gap-1 mt-2 text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {showFullDescription ? 'Show less' : 'Show more'}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        showFullDescription ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                )}
              </div>
            )}

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {video.tags.slice(0, 6).map((tag) => (
                  <span
                    key={tag.id || tag.name}
                    className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/60 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
