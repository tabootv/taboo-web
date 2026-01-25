'use client';

import { cn } from '@/shared/utils/formatting';
import { getCountryName } from '@/shared/utils/country';
import { Globe } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { CreatorFeaturedVideoProps } from './types';

function PlayIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function CreatorFeaturedVideo({
  video,
}: CreatorFeaturedVideoProps) {

  return (
    <section className="bg-black py-9">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <h2
          className="text-2xl! sm:text-3xl! md:text-4xl! lg:text-5xl! font-bold leading-tight tracking-tight text-white mb-4 sm:mb-6"
        >
          Latest Release
        </h2>
        <Link
          href={`/videos/${video.uuid}`}
          rel="noopener noreferrer"
          className={cn(
            'block text-inherit no-underline',
            'transition-all duration-250',
            'hover:-translate-y-1 hover:scale-[1.02]',
            'hover:shadow-[0_8px_30px_rgba(171,0,19,0.2)]'
          )}
        >
          <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-[#111]">
            <Image
              src={video.thumbnail || video.thumbnail_webp || ''}
              alt={video.title}
              width={1280}
              height={720}
              className="w-full h-full object-cover"
            />

            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)',
              }}
            />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="rounded-full bg-[#AB0113]/90 flex items-center justify-center backdrop-blur-sm shadow-[0_8px_32px_rgba(171,0,19,0.4)]"
                style={{
                  width: 'clamp(44px, 10vw, 58px)',
                  height: 'clamp(44px, 10vw, 58px)',
                }}
              >
                <PlayIcon />
              </div>
            </div>

            {getCountryName(video.country) && (
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-1 px-2.5 py-1.5 bg-black/75 rounded text-xs text-[#ccc] uppercase tracking-wide">
                <Globe className="w-3 h-3" /> {getCountryName(video.country)}
              </div>
            )}
          </div>

          <div className="pt-4">
            <h3
              className="text-white font-semibold mb-1.5 text-base! sm:text-lg! sm:mb-2"
            >
              {video.title}
            </h3>

            {video.description && (
              <p className="text-sm leading-6 text-white/60 mb-2.5 line-clamp-2">
                {video.description}
              </p>
            )}

            {getCountryName(video.country) && (
              <span className="inline-flex items-center gap-1 text-xs text-white/60 bg-white/10 px-2.5 py-1 rounded-2xl">
                <Globe className="w-3 h-3" /> {getCountryName(video.country)}
              </span>
            )}
          </div>
        </Link>
      </div>
    </section>
  );
}
