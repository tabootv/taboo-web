'use client';

import { useToggleBookmark } from '@/api/mutations';
import { useFeature } from '@/hooks/use-feature';
import type { Video } from '@/types';
import { Bookmark } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SaveButtonProps {
  video: Video;
}

export function SaveButton({ video }: SaveButtonProps) {
  const bookmarksEnabled = useFeature('BOOKMARK_SYSTEM');
  const toggleBookmark = useToggleBookmark();
  const [optimisticSaved, setOptimisticSaved] = useState(
    video.is_bookmarked || video.in_watchlist || false
  );
  useEffect(() => {
    setOptimisticSaved(video.is_bookmarked || video.in_watchlist || false);
  }, [video.is_bookmarked, video.in_watchlist]);
  const saved = optimisticSaved;

  const handleToggle = () => {
    if (!video.uuid) return;
    setOptimisticSaved((prev) => !prev);
    toggleBookmark.mutate(
      { videoUuid: video.uuid, videoId: video.id },
      {
        onError: (error) => {
          setOptimisticSaved(video.is_bookmarked || video.in_watchlist || false);
          console.error('Failed to toggle bookmark:', error);
        },
      }
    );
  };

  if (!bookmarksEnabled) return null;

  const baseClasses =
    'inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full border border-white/10 bg-white/5 text-white transition-colors';

  const activeClasses = saved
    ? 'bg-white text-black border-white/30'
    : 'hover:bg-white/10 hover:border-white/20';

  return (
    <button
      onClick={handleToggle}
      aria-label={saved ? 'Saved' : 'Save'}
      disabled={toggleBookmark.isPending}
      className={`${baseClasses} ${activeClasses} disabled:opacity-60`}
    >
      <Bookmark className={`w-4 h-4 md:w-5 md:h-5 ${saved ? 'fill-current' : ''}`} />
    </button>
  );
}
