'use client';

import { CreatorFollowButton } from '@/features/creator/components/CreatorFollowButton';
import { usePrefetch } from '@/hooks/use-prefetch';
import { getCreatorRoute } from '@/shared/utils/formatting';
import type { Creator } from '@/types';
import { Video } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CreatorCardProps {
  creator: Creator;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const { prefetchRoute } = usePrefetch();
  const href = getCreatorRoute(creator.handler);

  return (
    <div className="creator-card-bg h-full">
      <Link
        href={href}
        prefetch={true}
        onMouseEnter={() => prefetchRoute(href)}
        className="flex flex-col h-full"
      >
        <div className="relative h-[110px] w-full rounded-t-lg overflow-hidden">
          {creator.banner ? (
            <Image
              src={creator.banner}
              alt={`${creator.name} banner`}
              fill
              sizes="(max-width: 640px) 90vw, 300px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-red-dark to-red-primary" />
          )}
          <div className="absolute inset-0 bg-linear-to-b from-black/20 to-black/50" />
        </div>

        <div className="card-content flex-1">
          <div className="relative size-[88px] rounded-full overflow-hidden border-4 border-surface -mt-[60px] bg-surface shrink-0">
            {creator.dp ? (
              <Image
                src={creator.dp}
                alt={creator.name || 'Creator'}
                fill
                sizes="88px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-red-primary to-red-dark flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {(creator.name || 'C').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="w-full">
            <div className="flex items-center justify-between gap-[10px]">
              <div>
                <p className="text-[18px] font-medium text-white">{creator.name}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 text-xs text-text-secondary border border-white/10">
                    <Video className="w-3.5 h-3.5" />
                    <span className="font-medium">{creator.videos_count || 0}</span>
                    <span className="uppercase tracking-wide text-[10px] opacity-70">Videos</span>
                  </span>
                </div>
              </div>

              <div className="hidden md:block">
                <CreatorFollowButton creator={creator} size="sm" />
              </div>
            </div>

            <p className="text-[14px] font-normal text-[#9D9D9D] mt-3 line-clamp-3">
              {creator.description}
            </p>
          </div>
        </div>

        <div className="md:hidden">
          <CreatorFollowButton
            creator={creator}
            size="sm"
            className="w-[93%] mx-auto my-[15px] min-w-[120px]"
          />
        </div>
      </Link>
    </div>
  );
}
