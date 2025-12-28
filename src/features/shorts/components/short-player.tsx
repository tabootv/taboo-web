'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music2,
  Volume2,
  VolumeX,
  Play,
} from 'lucide-react';
import type { Video } from '@/types';
import { Avatar } from '@/components/ui';
import { formatCompactNumber } from '@/lib/utils';
import { shorts as shortsApi } from '@/lib/api';
import { toast } from 'sonner';
import { usePrefersReducedMotion } from '@/lib/hooks';

interface ShortPlayerProps {
  short: Video;
  isActive: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function ShortPlayer({ short, isActive, onNext: _onNext, onPrevious: _onPrevious }: ShortPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(short.is_liked ?? false);
  const [likesCount, setLikesCount] = useState(short.likes_count ?? 0);
  const [isBookmarked, setIsBookmarked] = useState(short.is_bookmarked ?? false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const attemptPlay = useCallback(async () => {
    const videoEl = videoRef.current;
    if (!videoEl || prefersReducedMotion) return;

    const playWith = async (muted: boolean) => {
      videoEl.muted = muted;
      try {
        await videoEl.play();
        return true;
      } catch {
        return false;
      }
    };

    const preferredMuted = isMuted;
    const playedPreferred = await playWith(preferredMuted);
    if (playedPreferred) return;

    const playedMuted = await playWith(true);
    if (playedMuted && !preferredMuted) {
      videoEl.muted = false;
    }
  }, [isMuted, prefersReducedMotion]);

  // Auto-play when active
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive && !prefersReducedMotion) {
      void attemptPlay();
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [attemptPlay, isActive, prefersReducedMotion]);

  // Handle play/pause events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
    };
    const handleEnded = () => {
      // Loop the video
      video.currentTime = 0;
      video.play();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      void attemptPlay();
    }
  }, [attemptPlay, isPlaying]);

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleLike = async () => {
    try {
      await shortsApi.toggleLike(short.uuid);
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    } catch {
      toast.error('Please login to like');
    }
  };

  const handleBookmark = async () => {
    try {
      await shortsApi.toggleBookmark(short.uuid);
      setIsBookmarked(!isBookmarked);
      toast.success(isBookmarked ? 'Removed from saved' : 'Saved');
    } catch {
      toast.error('Please login to save');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: short.title,
        url: `${window.location.origin}/shorts/${short.uuid}`,
      });
    } catch {
      await navigator.clipboard.writeText(`${window.location.origin}/shorts/${short.uuid}`);
      toast.success('Link copied');
    }
  };

  const videoSrc = short.url_720 || short.url_480 || short.hls_url || '';

  return (
    <div className="relative h-full w-full max-w-[400px] bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={short.thumbnail}
        className="h-full w-full object-contain"
        playsInline
        loop
        muted={isMuted}
        onClick={togglePlay}
        controlsList="nodownload noremoteplayback"
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Play/Pause overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
          >
            <Play className="w-8 h-8 text-white ml-1" />
          </button>
        </div>
      )}

      {/* Mute button */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center"
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-white" />
        ) : (
          <Volume2 className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Right side actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isLiked ? 'bg-red-500' : 'bg-black/40'
            }`}
          >
            <Heart
              className={`w-6 h-6 ${isLiked ? 'text-white fill-white' : 'text-white'}`}
            />
          </div>
          <span className="text-white text-xs font-medium">
            {formatCompactNumber(likesCount)}
          </span>
        </button>

        {/* Comments */}
        <Link
          href={`/shorts/${short.uuid}`}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium">
            {formatCompactNumber(short.comments_count ?? 0)}
          </span>
        </Link>

        {/* Bookmark */}
        <button onClick={handleBookmark} className="flex flex-col items-center gap-1">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isBookmarked ? 'bg-yellow-500' : 'bg-black/40'
            }`}
          >
            <Bookmark
              className={`w-6 h-6 ${isBookmarked ? 'text-white fill-white' : 'text-white'}`}
            />
          </div>
          <span className="text-white text-xs font-medium">Save</span>
        </button>

        {/* Share */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium">Share</span>
        </button>

        {/* Channel Avatar */}
        {short.channel && (
          <Link
            href={`/creators/creator-profile/${short.channel.uuid}`}
            className="relative"
          >
            <Avatar
              src={short.channel.dp}
              alt={short.channel.name}
              size="md"
              fallback={short.channel.name}
              className="border-2 border-white"
            />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white text-xs">+</span>
            </div>
          </Link>
        )}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-4 left-4 right-20">
        {/* Channel name */}
        {short.channel && (
          <Link
            href={`/creators/creator-profile/${short.channel.uuid}`}
            className="font-semibold text-white mb-2 block"
          >
            @{short.channel.name}
          </Link>
        )}

        {/* Description */}
        <p className="text-white text-sm line-clamp-2">{short.title}</p>

        {/* Music/Audio info */}
        <div className="flex items-center gap-2 mt-2">
          <Music2 className="w-4 h-4 text-white" />
          <span className="text-white text-xs">Original audio</span>
        </div>
      </div>
    </div>
  );
}
