'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/shared/utils/formatting';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallback?: React.ReactNode;
  blurDataURL?: string;
  showSkeleton?: boolean;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto';
}

// Generate a simple blur placeholder SVG
const generateBlurPlaceholder = (width: number = 10, height: number = 10): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(30,30,30);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(50,50,50);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Default blur placeholder
const defaultBlurDataURL = generateBlurPlaceholder(16, 9);

export function OptimizedImage({
  src,
  alt,
  className,
  fallback,
  blurDataURL,
  showSkeleton = true,
  aspectRatio = 'auto',
  fill,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset states when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const aspectRatioClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[9/16]',
    auto: '',
  };

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-surface',
          aspectRatioClasses[aspectRatio],
          className
        )}
      >
        <div className="text-text-secondary text-sm">Image not available</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        aspectRatioClasses[aspectRatio],
        fill ? '' : className
      )}
    >
      {/* Skeleton loader */}
      {showSkeleton && isLoading && mounted && (
        <div className="absolute inset-0 bg-surface animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shimmer" />
        </div>
      )}

      <Image
        src={src}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          fill ? className : ''
        )}
        {...(fill !== undefined ? { fill } : {})}
        {...(blurDataURL || src ? { placeholder: 'blur' as const } : {})}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        {...props}
      />
    </div>
  );
}

// Thumbnail-specific optimized image with common presets
interface ThumbnailImageProps extends Omit<OptimizedImageProps, 'aspectRatio'> {
  variant?: 'video' | 'shorts' | 'avatar' | 'banner';
}

export function ThumbnailImage({ variant = 'video', className, ...props }: ThumbnailImageProps) {
  const variantConfig = {
    video: {
      aspectRatio: 'video' as const,
      sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px',
    },
    shorts: {
      aspectRatio: 'portrait' as const,
      sizes: '(max-width: 640px) 50vw, 180px',
    },
    avatar: {
      aspectRatio: 'square' as const,
      sizes: '64px',
    },
    banner: {
      aspectRatio: 'video' as const,
      sizes: '100vw',
    },
  };

  const config = variantConfig[variant];

  return (
    <OptimizedImage
      aspectRatio={config.aspectRatio}
      sizes={config.sizes}
      className={cn(
        variant === 'avatar' && 'rounded-full',
        variant === 'banner' && 'rounded-none',
        className
      )}
      {...props}
    />
  );
}
