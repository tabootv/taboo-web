'use client';

import { Flame, MessageCircle } from 'lucide-react';
import { useShortsStore } from '@/lib/stores/shorts-store';
import { videos as videosApi } from '@/lib/api';
import { toast } from 'sonner';

interface DesktopActionButtonsProps {
  videoUuid: string;
}

export function DesktopActionButtons({ videoUuid }: DesktopActionButtonsProps) {
  const { hasLiked, setHasLiked, toggleComments } = useShortsStore();

  const handleToggleLike = async () => {
    try {
      await videosApi.toggleLike(videoUuid);
      setHasLiked(!hasLiked);
    } catch {
      toast.error('Please login to like');
    }
  };

  return (
    <div className="md:flex flex-col gap-4 hidden">
      {/* Like button */}
      <button
        onClick={handleToggleLike}
        className={`w-[58px] h-[58px] rounded-full flex items-center justify-center transition-colors ${
          hasLiked ? 'bg-red-primary' : 'bg-surface hover:bg-surface/80'
        }`}
      >
        <Flame className={`w-6 h-6 ${hasLiked ? 'text-white' : 'text-white'}`} />
      </button>

      {/* Comment button */}
      <button
        onClick={toggleComments}
        className="w-[58px] h-[58px] rounded-full bg-surface hover:bg-surface/80 flex items-center justify-center transition-colors"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
