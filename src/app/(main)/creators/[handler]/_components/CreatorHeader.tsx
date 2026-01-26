'use client';

import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { cn } from '@/shared/utils/formatting';
import Image from 'next/image';
import type { CreatorHeaderProps } from './types';

export function CreatorHeader({
  creator,
  featuredVideoThumbnail,
  stats,
  socialLinks,
}: CreatorHeaderProps) {
  return (
    <section className="relative min-h-[60vh] flex items-end pb-12 pt-[130px]">
      <div className="absolute inset-0 overflow-hidden">
        {featuredVideoThumbnail && (
          <Image
            src={featuredVideoThumbnail}
            alt=""
            width={1920}
            height={1080}
            className="w-full h-full object-cover opacity-35 blur-sm"
          />
        )}

        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 60%, #000 100%)',
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex justify-center">
        <div className="max-w-2xl text-center flex flex-col items-center">
          <div
            className="rounded-full overflow-hidden border-[3px] border-white/20 mb-4"
            style={{
              width: 'clamp(70px, 18vw, 90px)',
              height: 'clamp(70px, 18vw, 90px)',
            }}
          >
            <Image
              src={creator.dp || ''}
              alt={creator.name}
              width={90}
              height={90}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center gap-3 mb-2.5">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight text-white m-0"
              style={{ fontSize: 'clamp(28px, 6vw, 42px)' }}
            >
              {creator.name}
            </h1>
            <span className="shrink-0">
              <VerifiedBadge size={20} />
            </span>
          </div>

          {creator.description && (
            <p
              className="text-xl leading-8 text-white/70 mb-5 max-w-[520px]"
              style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}
            >
              {creator.description.slice(0, 100)}
            </p>
          )}

          {stats.length > 0 && (
            <div className="flex items-center justify-center flex-wrap gap-1 mb-4 text-sm text-white/70">
              {stats.map((stat, idx) => (
                <span key={stat.key} className="inline-flex items-center gap-1.5">
                  <span className="text-[#AB0113] flex">{stat.icon}</span>
                  <span>
                    {stat.value} {stat.label}
                  </span>
                  {idx < stats.length - 1 && <span className="text-white/40 mx-2">•</span>}
                </span>
              ))}
            </div>
          )}

          {socialLinks.length > 0 && (
            <div className="flex items-center justify-center gap-3 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.key}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center justify-center',
                    'w-10 h-10 rounded-full',
                    'bg-white/10 border border-white/15',
                    'text-white/70',
                    'transition-all duration-200',
                    'hover:scale-115 hover:text-white hover:bg-[#AB0113]/30'
                  )}
                  title={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          )}

          {/* <Button
            href={checkoutUrl}
            external={true}
            className={cn(
              'px-7 py-3.5',
              'bg-[#AB0113] text-white',
              'text-sm font-semibold rounded-lg',
              'transition-all duration-200',
              'hover:scale-105 hover:shadow-[0_6px_20px_rgba(171,0,19,0.35)]',
              'relative z-10'
            )}
          >
            Start watching on Taboo
          </Button> */}
        </div>
      </div>
    </section>
  );
}
