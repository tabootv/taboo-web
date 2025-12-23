'use client';

import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import { useShortsStore } from '@/lib/stores/shorts-store';
import { videos as videosApi } from '@/lib/api';
import { toast } from 'sonner';

interface MobileActionButtonsProps {
  videoUuid: string;
  channelDp?: string;
}

// Fire icon SVG (matching Vue implementation)
function FireIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 23C16.1421 23 19.5 19.6421 19.5 15.5C19.5 13.0335 17.6373 10.1168 14.6716 6.37054C14.3425 5.95473 13.7663 5.85057 13.3109 6.11739C12.8554 6.38421 12.6785 6.93949 12.8821 7.42704C13.2498 8.30821 13.5 9.21854 13.5 10C13.5 10.7785 13.2581 11.4903 12.8536 12.0695C12.4489 11.4903 12.2071 10.7785 12.2071 10C12.2071 9.21854 12.4573 8.30821 12.825 7.42704C13.0286 6.93949 12.8517 6.38421 12.3962 6.11739C11.9407 5.85057 11.3646 5.95473 11.0355 6.37054C8.06976 10.1168 6.20711 13.0335 6.20711 15.5C6.20711 17.8137 7.19078 19.893 8.75736 21.3284C8.28614 20.7594 8 20.0148 8 19.2C8 17.8272 9.17157 15.6 12 12.8C12 15.6 10.3284 17.8272 10.3284 19.2C10.3284 20.0148 10.0423 20.7594 9.57107 21.3284C10.3095 21.7622 11.1246 22.0703 12 22.2097V23Z" />
    </svg>
  );
}

export function MobileActionButtons({ videoUuid, channelDp }: MobileActionButtonsProps) {
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
    <div className="flex flex-col gap-4 md:hidden absolute right-1 bottom-1">
      {/* Channel avatar */}
      {channelDp && (
        <Image
          src={channelDp}
          alt="Channel"
          width={44}
          height={44}
          className="size-[44px] rounded-full"
        />
      )}

      {/* Like button */}
      <button
        onClick={handleToggleLike}
        className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-colors ${
          hasLiked ? 'bg-red-primary' : 'bg-black/50'
        }`}
      >
        <FireIcon />
      </button>

      {/* Comment button */}
      <button
        onClick={toggleComments}
        className="w-[44px] h-[44px] rounded-full bg-black/50 flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
