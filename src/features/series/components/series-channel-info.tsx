'use client';

import { CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatRelativeTime, getCreatorRoute } from '@/shared/utils/formatting';

interface SeriesChannelInfoProps {
  channelHandler?: string;
  channelName?: string;
  channelDp?: string;
  publishedAt?: string;
}

export function SeriesChannelInfo({
  channelHandler,
  channelName,
  channelDp,
  publishedAt,
}: SeriesChannelInfoProps) {
  const href = getCreatorRoute(channelHandler);

  return (
    <div className="flex items-center gap-3">
      <Link href={href} className="shrink-0">
        <div className="relative w-10 h-10 rounded-full overflow-hidden">
          {channelDp ? (
            <Image src={channelDp} alt={channelName || 'Channel'} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface text-white font-semibold">
              {channelName?.charAt(0) || 'C'}
            </div>
          )}
        </div>
      </Link>
      <div className="min-w-0">
        <Link href={href} className="flex items-center gap-1.5 group">
          <span className="font-medium text-white group-hover:text-red-primary transition-colors truncate">
            {channelName}
          </span>
          <CheckCircle className="w-3.5 h-3.5 text-red-primary shrink-0" />
        </Link>
        <p className="text-xs text-white/50">
          {publishedAt || formatRelativeTime(publishedAt || '')}
        </p>
      </div>
    </div>
  );
}
