'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bookmark } from 'lucide-react';
import { useSavedVideosStore, type SavedVideo } from '@/lib/stores/saved-videos-store';
import type { Video } from '@/types';

interface SaveButtonProps {
  video: Video;
}

export function SaveButton({ video }: SaveButtonProps) {
  const { isSaved, toggleSave } = useSavedVideosStore();
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (video.id) {
      setSaved(isSaved(video.id));
    }
  }, [isSaved, video.id]);

  const handleToggle = useCallback(() => {
    if (!video.id) return;

    const savedVideo: SavedVideo = {
      id: video.id,
      title: video.title,
      thumbnail: video.thumbnail_webp || video.thumbnail || null,
      channelName: video.channel?.name || null,
      savedAt: Date.now(),
    };
    const newState = toggleSave(savedVideo);
    setSaved(newState);
  }, [video, toggleSave]);

  const baseClasses =
    'inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full border border-white/10 bg-white/5 text-white transition-colors';

  const activeClasses = saved
    ? 'bg-white text-black border-white/30'
    : 'hover:bg-white/10 hover:border-white/20';

  return (
    <button
      onClick={handleToggle}
      aria-label={saved ? 'Saved' : 'Save'}
      disabled={!mounted}
      className={`${baseClasses} ${activeClasses} disabled:opacity-60`}
    >
      <Bookmark
        className={`w-4 h-4 md:w-5 md:h-5 ${saved ? 'fill-current' : ''}`}
      />
    </button>
  );
}
