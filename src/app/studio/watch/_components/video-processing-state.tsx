'use client';

import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface VideoProcessingStateProps {
  thumbnail?: string | undefined;
  isShort?: boolean | undefined;
}

export function VideoProcessingState({ thumbnail, isShort }: VideoProcessingStateProps) {
  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      <div className={isShort ? 'aspect-[9/16] max-h-[70vh] mx-auto' : 'aspect-video'}>
        {thumbnail ? (
          <Image src={thumbnail} alt="Video thumbnail" fill className="object-cover opacity-40" />
        ) : (
          <div className="w-full h-full bg-white/5" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
          <div className="text-center px-4">
            <p className="text-white font-medium">Video is still processing</p>
            <p className="text-sm text-text-secondary mt-1">
              This video will be available for preview once processing completes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
