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

  return (
    <button
      onClick={handleToggle}
      aria-label={saved ? 'Saved' : 'Save'}
      disabled={toggleBookmark.isPending}
      className={`h-9 px-4 flex items-center gap-2 rounded-full transition-all ${
        saved ? 'bg-primary text-white' : 'bg-surface text-white hover:bg-hover'
      } disabled:opacity-60`}
    >
      <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
      <span className="text-sm font-medium">Save</span>
    </button>
  );
}
