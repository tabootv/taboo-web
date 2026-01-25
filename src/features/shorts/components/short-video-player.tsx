'use client';

import { useRef, useState, useEffect, useCallback, ReactNode } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useShortsStore } from '@/shared/stores/shorts-store';
import type { Video } from '@/types';
import { usePrefersReducedMotion } from '@/hooks';

interface ShortVideoPlayerProps {
  video: Video;
  index: number;
  isActive: boolean;
  children?: ReactNode; // For overlay slot
}

export function ShortVideoPlayer({ video, index: _index, isActive, children }: ShortVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const { isMuted, volume, toggleMute, setVolume } = useShortsStore();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Get video URL (prefer lower quality for shorts)
  const videoSrc = video.url_480 || video.url_720 || video.url_1080 || video.hls_url || '';

  const attemptPlay = useCallback(async () => {
    const videoEl = videoRef.current;
    if (!videoEl || prefersReducedMotion) {
      setIsBuffering(false);
      return;
    }

    const playWith = async (muted: boolean) => {
      videoEl.muted = muted;
      videoEl.volume = muted ? 0 : volume;
      try {
        await videoEl.play();
        setIsBuffering(false);
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
      videoEl.volume = volume;
    }
  }, [isMuted, prefersReducedMotion, volume]);

  // Handle play/pause based on active state
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (isActive && !prefersReducedMotion) {
      void attemptPlay();
    } else {
      videoEl.pause();
    }
  }, [attemptPlay, isActive, prefersReducedMotion]);

  // Initialize mute state and volume
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.muted = isMuted;
    videoEl.volume = isMuted ? 0 : volume;
  }, [isMuted, volume]);

  // Handle buffering states
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleCanPlayThrough = () => setIsBuffering(false);

    videoEl.addEventListener('waiting', handleWaiting);
    videoEl.addEventListener('playing', handlePlaying);
    videoEl.addEventListener('canplaythrough', handleCanPlayThrough);

    return () => {
      videoEl.removeEventListener('waiting', handleWaiting);
      videoEl.removeEventListener('playing', handlePlaying);
      videoEl.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (videoEl.paused) {
      void attemptPlay();
    } else {
      videoEl.pause();
    }
  }, [attemptPlay]);

  const handleToggleMute = useCallback(() => {
    toggleMute();
  }, [toggleMute]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
    },
    [setVolume]
  );

  return (
    <div className="relative overflow-hidden group rounded-2xl h-full mx-auto">
      {/* Slot for overlays (gradient and header) */}
      {children}

      {/* Volume controls - top left */}
      <div className="absolute top-0 p-2 left-0 right-0 rounded-t-xl w-full z-10 transition-all duration-200">
        <div
          className="volume-slider-row !w-full flex items-center gap-2"
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <button
            onClick={handleToggleMute}
            className="shorts-mute p-2 rounded-full bg-red-primary/80 hover:bg-red-primary transition-colors flex-shrink-0 z-20"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Volume slider with slide animation */}
          <div
            className={`volume-slider-outer transition-all duration-300 overflow-hidden flex items-center ${
              showVolumeSlider ? 'w-[180px] opacity-100 ml-2' : 'w-0 opacity-0'
            }`}
          >
            <div className="bg-black/50 rounded-full px-3 py-2 w-full">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider w-full h-1 bg-white/70 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-white
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading spinner */}
      {isBuffering && isActive && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/50 z-10"
          style={{ borderRadius: '10px' }}
        >
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        className="bg-black height-video-short rounded-2xl w-full h-full object-contain"
        preload="metadata"
        loop
        autoPlay={isActive}
        playsInline
        onClick={togglePlay}
        poster={video.thumbnail}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
