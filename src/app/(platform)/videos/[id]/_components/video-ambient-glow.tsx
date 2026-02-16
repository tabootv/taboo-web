'use client';

import { usePrefersReducedMotion } from '@/hooks';
import Image from 'next/image';
import { useCallback, useState } from 'react';

interface VideoAmbientGlowProps {
  thumbnailUrl: string;
}

export function VideoAmbientGlow({ thumbnailUrl }: VideoAmbientGlowProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback(() => setLoaded(true), []);

  if (prefersReducedMotion) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <Image
        src={thumbnailUrl}
        alt=""
        fill
        priority={false}
        quality={20}
        sizes="(max-width: 768px) 100vw, 70vw"
        className={`scale-150 object-cover transition-opacity duration-700 ${loaded ? 'opacity-50' : 'opacity-0'}`}
        style={{
          filter: 'blur(60px) saturate(1.4) brightness(0.7)',
          willChange: 'transform',
        }}
        onLoad={handleLoad}
      />
    </div>
  );
}
