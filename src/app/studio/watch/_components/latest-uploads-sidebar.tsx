'use client';

import { useStudioVideos } from '@/api/queries/studio.queries';
import { formatDuration, formatRelativeTime } from '@/shared/utils/formatting';
import { getVideoLink } from '@/shared/utils/video-link';
import type { StudioVideoListItem } from '@/types/studio';
import Image from 'next/image';
import Link from 'next/link';

function UploadCardSkeleton() {
  return (
    <div className="flex gap-2 rounded-lg p-2 -mx-2 animate-pulse">
      <div className="w-[168px] h-[94px] shrink-0 rounded-md bg-white/10" />
      <div className="flex-1 min-w-0 py-0.5">
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-3/4 bg-white/10 rounded mt-1.5" />
        <div className="h-3 w-1/2 bg-white/5 rounded mt-2" />
      </div>
    </div>
  );
}

function UploadCard({ video, isActive }: { video: StudioVideoListItem; isActive: boolean }) {
  const href = getVideoLink({
    uuid: video.uuid,
    isShort: !!video.short,
    isPublished: !!video.published,
    isHidden: video.hidden,
  });

  return (
    <Link
      href={href}
      prefetch={false}
      className={`group flex gap-2 rounded-lg p-2 -mx-2 transition-colors hover:bg-surface ${
        isActive ? 'bg-surface' : ''
      }`}
    >
      <div className="relative w-[168px] h-[94px] shrink-0 rounded-md overflow-hidden bg-surface">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            sizes="168px"
            className="object-cover"
          />
        ) : (
          <div className="size-full flex items-center justify-center text-text-secondary text-xs">
            No thumbnail
          </div>
        )}
        {video.duration != null && video.duration > 0 ? (
          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[11px] font-medium px-1 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>
        ) : null}
      </div>

      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-sm font-medium text-white line-clamp-2 leading-snug group-hover:text-text-primary">
          {video.title}
        </p>
        <p className="text-xs text-text-secondary mt-1">
          {formatRelativeTime(video.published_at || video.created_at)}
          {video.views_count != null ? ` \u00B7 ${video.views_count.toLocaleString()} views` : ''}
        </p>
      </div>
    </Link>
  );
}

interface LatestUploadsSidebarProps {
  currentVideoUuid: string;
}

export function LatestUploadsSidebar({ currentVideoUuid }: LatestUploadsSidebarProps) {
  const { data, isLoading } = useStudioVideos({
    page: 1,
    per_page: 8,
    types: ['videos', 'shorts'],
    sort_by: 'latest',
  });

  const videos = data?.videos?.filter((v) => v.uuid !== currentVideoUuid) ?? [];

  return (
    <aside className="w-full lg:w-[402px] shrink-0">
      <h3 className="text-sm font-medium text-text-secondary mb-3">Latest Uploads</h3>

      <div className="flex flex-col gap-2">
        {isLoading ? (
          <>
            <UploadCardSkeleton />
            <UploadCardSkeleton />
            <UploadCardSkeleton />
            <UploadCardSkeleton />
          </>
        ) : videos.length === 0 ? (
          <p className="text-text-secondary text-sm py-4">No uploads yet.</p>
        ) : (
          videos.map((video) => (
            <UploadCard key={video.uuid} video={video} isActive={video.uuid === currentVideoUuid} />
          ))
        )}
      </div>
    </aside>
  );
}
