'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useSavedVideosStore, type SavedVideo } from '@/lib/stores/saved-videos-store';
import type { Video } from '@/types';
import { PreviewVideoPlayer } from './components/PreviewVideoPlayer';
import { PreviewMediaInfo } from './components/PreviewMediaInfo';

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
          <PreviewVideoPlayer
            video={video}
            thumbnail={thumbnail}
            previewUrl={previewUrl}
            isVideoPlaying={isVideoPlaying}
            isVideoReady={isVideoReady}
            isMuted={isMuted}
            isNew={isNew}
            videoRef={videoRef}
            onVideoReady={() => setIsVideoReady(true)}
            onPlay={handlePlay}
            onToggleMute={toggleMute}
          />

          <PreviewMediaInfo
            video={video}
            saved={saved}
            showFullDescription={showFullDescription}
            description={description}
            onSave={handleSave}
            onToggleDescription={() => setShowFullDescription(!showFullDescription)}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
