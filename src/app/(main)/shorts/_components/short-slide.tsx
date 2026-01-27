'use client';

import type { SlideClass } from '@/features/shorts/hooks/use-vertical-feed';
import { cn } from '@/shared/utils/formatting';
import type { Video } from '@/types';
import { ShortActionButtons } from './short-action-buttons';
import { ShortCreatorInfo } from './short-creator-info';
import { ShortVideoPlayer } from './short-video-player';

interface ShortSlideProps {
  video: Video;
  slideClass: SlideClass;
  isActive: boolean;
  isNearActive: boolean;
}

export function ShortSlide({ video, slideClass, isActive, isNearActive }: ShortSlideProps) {
  return (
    <div className={cn('short-slide', slideClass)}>
      <div className="short-slide-inner">
        <div className="short-video-wrapper">
          {/* Video player */}
          <ShortVideoPlayer video={video} isActive={isActive} isNearActive={isNearActive} />

          {/* Bottom gradient */}
          <div className="short-gradient-bottom" />

          {/* Top gradient for mobile status bar */}
          <div className="short-gradient-top md:hidden" />

          {/* Content overlay */}
          <div className="short-content">
            {/* Left side: Creator info and caption */}
            <div className="short-info-animated flex-1 pr-4">
              <ShortCreatorInfo channel={video.channel} />

              {/* Caption */}
              <p className="text-white text-sm mt-2 line-clamp-2 leading-relaxed">{video.title}</p>

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {video.tags
                    .filter((tag) => tag.should_show)
                    .slice(0, 4)
                    .map((tag) => (
                      <span key={tag.id} className="text-white/80 text-sm">
                        #{tag.name}
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Right side: Action buttons */}
            <ShortActionButtons video={video} />
          </div>
        </div>
      </div>
    </div>
  );
}
