'use client';

import { VideoPlayer } from '@/features/video/components/video-player';
import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl: string;
  thumbnail: string;
  title: string;
  onEnded?: () => void;
}

export function TrailerModal({
  isOpen,
  onClose,
  trailerUrl,
  thumbnail,
  title,
  onEnded,
}: TrailerModalProps) {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trailer-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
    >
      <div ref={modalRef} className="relative w-full max-w-6xl mx-4 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
          aria-label="Close trailer"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
          <VideoPlayer
            thumbnail={thumbnail}
            url_1080={trailerUrl}
            autoplay={true}
            onEnded={() => onEnded?.()}
          />
        </div>

        <p id="trailer-title" className="mt-4 text-center text-white/70 text-sm">
          {title} - Trailer
        </p>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
