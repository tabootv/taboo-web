'use client';

import { useToggleShortBookmark, useToggleShortLike } from '@/api/mutations/shorts.mutations';
import { useShortsStore } from '@/shared/stores/shorts-store';
import { formatCompactNumber } from '@/shared/utils/formatting';
import type { Video } from '@/types';
import { Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface ShortActionButtonsProps {
  video: Video;
}

export function ShortActionButtons({ video }: ShortActionButtonsProps) {
  const { toggleComments } = useShortsStore();
  const toggleLike = useToggleShortLike();
  const toggleBookmark = useToggleShortBookmark();

  const hasLiked = video.has_liked ?? false;
  const isBookmarked = video.is_bookmarked ?? false;
  const likesCount = video.likes_count ?? 0;
  const commentsCount = video.comments_count ?? 0;

  const handleLike = useCallback(() => {
    toggleLike.mutate(video.uuid, {
      onError: () => toast.error('Please login to like'),
    });
  }, [toggleLike, video.uuid]);

  const handleBookmark = useCallback(() => {
    toggleBookmark.mutate(video.uuid, {
      onError: () => toast.error('Please login to bookmark'),
    });
  }, [toggleBookmark, video.uuid]);

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

  const handleComment = useCallback(() => {
    toggleComments();
  }, [toggleComments]);

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

      {/* Comment button */}
      <button className="short-action-button" onClick={handleComment}>
        <div className="short-action-icon">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <span>{formatCompactNumber(commentsCount)}</span>
      </button>

      {/* Bookmark button */}
      <button className="short-action-button" onClick={handleBookmark}>
        <div className="short-action-icon">
          <Bookmark
            className={`w-6 h-6 transition-colors ${
              isBookmarked ? 'text-yellow-500 fill-yellow-500' : 'text-white'
            }`}
          />
        </div>
        <span>Save</span>
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
