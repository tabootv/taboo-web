'use client';

import { useVideosByTags } from '@/api/queries/video.queries';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { usePrefetchVideo } from '@/shared/hooks/use-prefetch-video';
import { formatRelativeTime } from '@/shared/utils/formatting';
import { getTagKey } from '@/shared/utils/tags';
import type { Tag, Video } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

// --- Helper functions (keep cognitive complexity low) ---

function getFilteredVideos(videos: Video[], selectedTag: string | null): Video[] {
  const limit = 7;
  if (!selectedTag) return videos.slice(0, limit);
  const tagged = videos.filter((v) => v.tags?.some((t) => t.name === selectedTag));
  const fillers = videos.filter((v) => !tagged.includes(v));
  return [...tagged, ...fillers].slice(0, limit);
}

function getVisibleTags(tags?: Tag[]): Tag[] {
  if (!tags) return [];
  return tags.filter((t) => t.should_show !== false).slice(0, 5);
}

function extractTagIds(tags?: Tag[]): number[] {
  if (!tags) return [];
  return tags
    .filter((t) => t.should_show !== false)
    .map((t) => t.id)
    .filter(Boolean);
}

// --- Sub-components ---

function TagChips({
  tags,
  selectedTag,
  onSelect,
}: {
  tags: Tag[];
  selectedTag: string | null;
  onSelect: (tag: string | null) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeft(scrollLeft > 10);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll, tags.length]);

  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -150 : 150,
      behavior: 'smooth',
    });
  };

  if (tags.length === 0) return null;

  return (
    <div className="relative mb-3 group/tags">
      {showLeft ? (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 size-7 rounded-full bg-black/70 backdrop-blur hover:bg-black/80 transition-colors flex items-center justify-center"
          aria-label="Previous tags"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
      ) : null}

      {showRight ? (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 size-7 rounded-full bg-black/70 backdrop-blur hover:bg-black/80 transition-colors flex items-center justify-center"
          aria-label="Next tags"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      ) : null}

      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto hide-scrollbar scroll-smooth py-1 px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <button
          onClick={() => onSelect(null)}
          className={`shrink-0 px-2 py-[6px] rounded-full text-[13px] font-medium transition-colors border ${
            selectedTag === null
              ? 'bg-black/50 text-white border-white/40'
              : 'bg-surface/60 text-white border-border hover:bg-hover'
          }`}
        >
          All
        </button>

        {tags.map((tag) => (
          <button
            key={getTagKey(tag)}
            onClick={() => onSelect(tag.name)}
            className={`shrink-0 px-2 py-[6px] rounded-full text-[13px] font-medium transition-colors border ${
              selectedTag === tag.name
                ? 'bg-black/50 text-white border-white/40'
                : 'bg-surface/60 text-white border-border hover:bg-hover'
            }`}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function RelatedVideoCard({
  item,
  isActive,
  onHover,
}: {
  item: Video;
  isActive: boolean;
  onHover: () => void;
}) {
  return (
    <Link
      href={`/videos/${item.uuid || item.id}`}
      prefetch={false}
      onMouseEnter={onHover}
      className={`group flex gap-2 rounded-lg p-2 -mx-2 transition-colors hover:bg-surface ${
        isActive ? 'bg-surface' : ''
      }`}
    >
      <div className="relative w-[168px] h-[94px] shrink-0 rounded-md overflow-hidden bg-surface">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail_webp || item.thumbnail}
            alt={item.title}
            fill
            sizes="168px"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-sm font-medium text-white line-clamp-2 leading-snug group-hover:text-text-primary">
          {item.title}
        </p>
        <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
          {item.channel?.name}
          <span className="shrink-0">
            <VerifiedBadge size={12} />
          </span>
        </p>
        <p className="text-xs text-text-secondary">{formatRelativeTime(item.published_at)}</p>
      </div>
    </Link>
  );
}

// --- Main component ---

interface RelatedVideosSidebarProps {
  initialVideos: Video[];
  currentVideo: Video;
  videoTags?: Tag[] | undefined;
}

export function RelatedVideosSidebar({
  initialVideos,
  currentVideo,
  videoTags,
}: RelatedVideosSidebarProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const prefetchVideo = usePrefetchVideo();

  const videoId = String(currentVideo.uuid || currentVideo.id);
  const tags = videoTags || currentVideo.tags || [];
  const tagIds = extractTagIds(tags);
  const displayedTags = getVisibleTags(tags);

  // Client-side tag-based fetch with server-seeded initialData
  const { data: tagVideos } = useVideosByTags(tagIds, videoId, {
    initialData: initialVideos,
  });

  const videos = tagVideos || initialVideos;
  const filteredVideos = getFilteredVideos(videos, selectedTag);

  // Reset tag on video change
  useEffect(() => {
    setSelectedTag(null);
  }, [videoId]);

  return (
    <div className="w-full lg:w-[402px] shrink-0">
      <TagChips tags={displayedTags} selectedTag={selectedTag} onSelect={setSelectedTag} />

      <div className="flex flex-col gap-2">
        {filteredVideos.length === 0 ? (
          <p className="text-text-secondary text-sm py-4">No related videos found.</p>
        ) : (
          filteredVideos.map((item) => (
            <RelatedVideoCard
              key={item.id}
              item={item}
              isActive={String(item.uuid || item.id) === videoId}
              onHover={() => prefetchVideo(String(item.uuid || item.id))}
            />
          ))
        )}
      </div>
    </div>
  );
}
