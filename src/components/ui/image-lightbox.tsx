'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

interface ImageLightboxProps {
  images: Array<{ id: number | string; url: string }>;
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const imageContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, open]);

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentIndex, images.length]);

  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;
  const canGoPrev = hasMultiple && currentIndex > 0;
  const canGoNext = hasMultiple && currentIndex < images.length - 1;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canGoPrev) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canGoNext) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicked directly on the backdrop, not on children
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();

    const naturalRatio = img.naturalWidth / img.naturalHeight;
    const containerRatio = rect.width / rect.height;

    let renderedWidth: number;
    let renderedHeight: number;

    if (naturalRatio > containerRatio) {
      renderedWidth = rect.width;
      renderedHeight = rect.width / naturalRatio;
    } else {
      renderedHeight = rect.height;
      renderedWidth = rect.height * naturalRatio;
    }

    const offsetX = (rect.width - renderedWidth) / 2;
    const offsetY = (rect.height - renderedHeight) / 2;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const isOnImage =
      clickX >= offsetX &&
      clickX <= offsetX + renderedWidth &&
      clickY >= offsetY &&
      clickY <= offsetY + renderedHeight;

    if (!isOnImage) {
      onOpenChange(false);
    }
  };

  if (!currentImage || images.length === 0) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <VisuallyHidden>
          <Dialog.Title />
        </VisuallyHidden>
        <Dialog.Content
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm cursor-zoom-out focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onClick={handleBackdropClick}
          onEscapeKeyDown={() => onOpenChange(false)}
        >
          {/* Close Button */}
          <Dialog.Close className="absolute top-4 right-4 z-[101] p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 hover:border-white/40 transition-all group">
            <X className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          {/* Navigation Arrows */}
          {hasMultiple && (
            <>
              {canGoPrev && (
                <button
                  onClick={handlePrev}
                  type="button"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-[101] p-3 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 hover:border-white/40 transition-all group"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </button>
              )}
              {canGoNext && (
                <button
                  onClick={handleNext}
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-[101] p-3 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 hover:border-white/40 transition-all group"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </button>
              )}
            </>
          )}

          {/* Image Container */}
          <div
            ref={imageContainerRef}
            className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center cursor-zoom-out"
            onClick={handleBackdropClick}
          >
            <div
              className="relative w-full h-full max-w-full max-h-full"
              onClick={handleBackdropClick}
            >
              <Image
                src={currentImage.url}
                alt={`Image ${currentIndex + 1} of ${images.length}`}
                fill
                className="object-contain cursor-default"
                onClick={handleImageClick}
                priority
                sizes="90vw"
                unoptimized={currentImage.url.startsWith('http')}
              />
            </div>
          </div>

          {/* Image Counter */}
          {hasMultiple && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[101] px-4 py-2 rounded-full bg-black/60 border border-white/20 text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
