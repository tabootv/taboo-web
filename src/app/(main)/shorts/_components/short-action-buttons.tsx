'use client';

import { useToggleShortLike } from '@/api/mutations/shorts.mutations';
import { useShortDetail } from '@/features/shorts/hooks/use-short-detail';
import { formatCompactNumber } from '@/shared/utils/formatting';
import type { Video } from '@/types';
import { Heart, Share2 } from 'lucide-react';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface ShortActionButtonsProps {
  video: Video;
}

export function ShortActionButtons({ video }: ShortActionButtonsProps) {
  const toggleLike = useToggleShortLike();

  // Subscribe to detail query cache for reactive updates
  const cachedShort = useShortDetail(video.uuid);

  // Use cached data if available, fallback to prop
  const hasLiked = cachedShort?.has_liked ?? video.has_liked ?? false;
  const likesCount = cachedShort?.likes_count ?? video.likes_count ?? 0;

  const handleLike = useCallback(() => {
    toggleLike.mutate(video.uuid, {
      onError: () => toast.error('Please login to like'),
    });
  }, [toggleLike, video.uuid]);

  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/shorts/${video.uuid}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    }
  }, [video.uuid, video.title]);

  return (
    <div className="short-action-buttons">
      {/* Like button */}
      <button className="short-action-button" onClick={handleLike}>
        <div className="short-action-icon">
          <Heart
            className={`w-6 h-6 transition-colors ${
              hasLiked ? 'text-red-500 fill-red-500' : 'text-white'
            }`}
          />
        </div>
        <span>{formatCompactNumber(likesCount)}</span>
      </button>

      {/* Share button */}
      <button className="short-action-button" onClick={handleShare}>
        <div className="short-action-icon">
          <Share2 className="w-6 h-6 text-white" />
        </div>
        <span>Share</span>
      </button>
    </div>
  );
}
