'use client';

import { useSavedVideosStore, type SavedVideo } from '@/shared/stores/saved-videos-store';
import { formatDuration, formatRelativeTime } from '@/shared/utils/formatting';
import type { Video } from '@/types';
import { Check, Clock, Play, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface RailCardProps {
  video: Video;
  onOpenPreview?: (video: Video) => void;
  showDate?: boolean;
  priority?: boolean;
}

export const RailCard = memo(function RailCard({
  video,
  onOpenPreview,
  showDate,
  priority = false,
}: RailCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [saved, setSaved] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { isSaved, toggleSave } = useSavedVideosStore();

  // Check saved state on mount
  useEffect(() => {
    if (video.id) {
      setSaved(isSaved(video.id));
    }
  }, [isSaved, video.id]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const thumbnail = video.thumbnail_webp || video.thumbnail || video.card_thumbnail;
  const previewUrl = video.url_480 || video.url_720;

  // Memoize the "new" calculation to avoid recalculating on every render
  const isNew = useMemo(() => {
    if (!video.published_at) return false;
    const publishedTime = new Date(video.published_at).getTime();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return publishedTime > sevenDaysAgo;
  }, [video.published_at]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);

    if (previewUrl) {
      hoverTimeoutRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current
            .play()
            .then(() => setIsVideoPlaying(true))
            .catch(() => {});
        }
      }, 500);
    }
  }, [previewUrl]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsVideoPlaying(false);
    setIsVideoReady(false);

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  const handleSave = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
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
    },
    [video, toggleSave]
  );

  const handleOpenPreview = useCallback(
    (e: React.MouseEvent) => {
      // Only open preview if clicking the info button, not the whole card
      e.preventDefault();
      e.stopPropagation();
      onOpenPreview?.(video);
    },
    [onOpenPreview, video]
  );

  // Card content - either link to video or opens preview modal
  const cardContent = (
    <div
      ref={cardRef}
      className="flex-shrink-0 snap-start w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface group">
        {/* Thumbnail */}
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={video.title}
            fill
            className={`object-cover transition-all duration-300 ${
              isHovered ? 'scale-105' : 'scale-100'
            } ${isVideoPlaying && isVideoReady ? 'opacity-0' : 'opacity-100'}`}
            sizes="(max-width: 768px) 50vw, (max-width: 1400px) 25vw, 16.66vw"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-hover flex items-center justify-center">
            <Play className="w-12 h-12 text-white/30" />
          </div>
        )}

        {/* Video Preview */}
        {previewUrl && (
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isVideoPlaying && isVideoReady ? 'opacity-100' : 'opacity-0'
            }`}
            muted
            loop
            playsInline
            preload="none"
            onLoadedData={() => setIsVideoReady(true)}
          >
            <source src={previewUrl} type="video/mp4" />
          </video>
        )}

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
            isHovered && !isVideoPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="p-3 bg-red-primary rounded-full transform transition-transform hover:scale-110">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>

        {/* NEW Badge */}
        {isNew && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-primary text-white text-[10px] font-bold rounded">
            NEW
          </div>
        )}

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-[10px] font-medium rounded flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(video.duration)}
          </div>
        )}

        {/* Hover Action Buttons */}
        <div
          className={`absolute bottom-2 left-2 flex items-center gap-1.5 transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`p-1.5 rounded-full border transition-all hover:scale-110 ${
              saved ? 'bg-white/20 border-white' : 'bg-black/60 border-white/40 hover:border-white'
            }`}
            title={saved ? 'Remove from My List' : 'Add to My List'}
          >
            {saved ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : (
              <Plus className="w-3.5 h-3.5 text-white" />
            )}
          </button>

          {/* More Info Button (opens modal) */}
          {onOpenPreview && (
            <button
              onClick={handleOpenPreview}
              className="px-2.5 py-1 bg-black/60 border border-white/40 hover:border-white rounded-full text-[10px] text-white font-medium transition-all hover:scale-105"
            >
              More Info
            </button>
          )}
        </div>
      </div>

      {/* Card Info */}
      <div className="mt-2">
        <h3 className="font-medium text-white text-sm line-clamp-2 leading-snug group-hover:text-red-primary transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {(() => {
            // Check multiple sources for profile picture (API returns dp in different locations)
            const videoAny = video as Video & {
              creator?: { dp?: string; channel?: { dp?: string } };
              user?: { dp?: string; small_dp?: string };
            };
            const profilePic =
              video.channel?.dp ||
              videoAny.creator?.dp ||
              videoAny.creator?.channel?.dp ||
              videoAny.user?.dp ||
              videoAny.user?.small_dp;

            if (profilePic) {
              return (
                <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                  <Image src={profilePic} alt="" fill className="object-cover" />
                </div>
              );
            }
            if (video.channel?.name) {
              return (
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-primary/80 to-red-dark flex items-center justify-center flex-shrink-0">
                  <span className="text-[8px] text-white font-bold">
                    {video.channel.name.charAt(0)}
                  </span>
                </div>
              );
            }
            return null;
          })()}
          <p className="text-xs text-white/50 truncate">{video.channel?.name}</p>
        </div>
        {showDate && video.published_at && (
          <p className="text-xs text-white/40 mt-0.5">{formatRelativeTime(video.published_at)}</p>
        )}
      </div>
    </div>
  );

  // Wrap in Link for navigation
  return (
    <Link href={`/videos/${video.uuid || video.id}`} className="block">
      {cardContent}
    </Link>
  );
});
