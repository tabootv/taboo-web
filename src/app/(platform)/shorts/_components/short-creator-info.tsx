'use client';

import { useCreatorById } from '@/hooks/use-creator-by-id';
import { getCreatorRoute } from '@/shared/utils/formatting';
import type { Channel } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface ShortCreatorInfoProps {
  channel: Channel | undefined;
}

export function ShortCreatorInfo({ channel }: ShortCreatorInfoProps) {
  const creator = useCreatorById(channel?.id);
  if (!channel || !creator) return null;

  const channelRoute = getCreatorRoute(creator.handler);

  return (
    <Link href={channelRoute} className="inline-flex items-center gap-2 group">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 shrink-0">
        {channel.dp ? (
          <Image
            src={channel.dp}
            alt={channel.name || 'Channel'}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
            <span className="text-white text-sm font-bold">{channel.name?.charAt(0) || '?'}</span>
          </div>
        )}
      </div>

      {/* Channel name */}
      <span className="font-bold text-white text-base group-hover:underline">
        @{channel.name || 'unknown'}
      </span>
    </Link>
  );
}
