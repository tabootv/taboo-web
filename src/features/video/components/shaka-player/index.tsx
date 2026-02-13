'use client';

import { cn } from '@/shared/utils/formatting';
import { Loader2, Play, Volume1, Volume2, VolumeX } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  useCaptionManagement,
  useKeyboardShortcuts,
  usePiPMode,
  usePlayerControls,
  useQualityManagement,
  useShakaPlayer,
} from './hooks';

const noop = () => {};
import { PlayerControls } from './player-controls';
import type { CaptionTrack, SeekPreview } from './types';

interface ShakaPlayerProps {
  src: string;
  thumbnail?: string | undefined;
  title?: string | undefined;
  autoplay?: boolean | undefined;
  onProgress?: ((progress: number) => void) | undefined;
  onTimeUpdate?: ((currentTime: number, duration: number) => void) | undefined;
  onPlay?: (() => void) | undefined;
  onPause?: (() => void) | undefined;
  onSeek?: ((time: number) => void) | undefined;
  onEnded?: (() => void) | undefined;
  className?: string | undefined;
  isBunnyVideo?: boolean | undefined;
  captions?: CaptionTrack[] | undefined;
  initialPosition?: number | undefined;
}

export function ShakaPlayer({
  src,
  thumbnail,
  title,
  autoplay = false,
  onProgress,
  onTimeUpdate,
  onPlay,
  onPause,
  onSeek,
  onEnded,
  className = '',
  isBunnyVideo = false,
  captions,
  initialPosition,
}: ShakaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [showThumbnail, setShowThumbnail] = useState(!!thumbnail && !autoplay);
  const [seekPreview, setSeekPreview] = useState<SeekPreview | null>(null);

  const {
    availableQualities,
    selectedQuality,
    isAutoQuality,
    playbackSpeed,
    updateQualityTracks,
    selectQuality,
    changePlaybackSpeed,
  } = useQualityManagement();

  const {
    availableCaptions,
    selectedCaption,
    captionsVisible,
    loadCaptions,
    selectCaption,
    disableCaptions,
    toggleCaptions,
  } = useCaptionManagement();

  const { isPiP, isPiPSupported, isPiPRef, togglePiP, handleEnterPiP, handleLeavePiP } = usePiPMode(
    { videoRef }
  );

  const handlePlayerLoaded = useCallback(
    (player: import('./types').ShakaPlayerInstance) => {
      if (captions?.length) {
        loadCaptions(captions, { current: player });
      }
    },
    [captions, loadCaptions]
  );

  const {
    isLoading,
    isBuffering,
    isPlaying,
    currentTime,
    duration,
    buffered,
    isPreviewReady,
    shakaRef,
    capturePreviewFrame,
    previewImage,
    ensurePreviewPlayer,
  } = useShakaPlayer({
    src,
    videoRef,
    previewVideoRef,
    isPiPRef,
    onQualityTracksUpdate: updateQualityTracks,
    onProgress,
    onTimeUpdate,
    onPlay,
    onPause,
    onEnded,
    onEnterPiP: handleEnterPiP,
    onLeavePiP: handleLeavePiP,
    initialPosition,
    onLoaded: handlePlayerLoaded,
  });

  const {
    volume,
    isMuted,
    isFullscreen,
    showControls,
    seekFeedback,
    volumeFeedback,
    togglePlay,
    handleVolumeChange,
    toggleMute,
    seek,
    seekToPercent,
    toggleFullscreen,
    showControlsTemporarily,
    handleDoubleTap,
  } = usePlayerControls({
    videoRef,
    containerRef,
    duration,
    isPlaying,
    showSettings: false,
    onSeek,
  });

  const handleSelectCaption = useCallback(
    (caption: import('./types').CaptionTrack) => {
      selectCaption(caption, shakaRef);
    },
    [selectCaption, shakaRef]
  );

  const handleDisableCaptions = useCallback(() => {
    disableCaptions(shakaRef);
  }, [disableCaptions, shakaRef]);

  const handleToggleCaptions = useCallback(() => {
    toggleCaptions(shakaRef);
  }, [toggleCaptions, shakaRef]);

  useKeyboardShortcuts({
    togglePlay,
    toggleFullscreen,
    toggleMute,
    togglePiP,
    toggleCaptions: handleToggleCaptions,
    seek,
    seekToPercent,
    volume,
    handleVolumeChange,
    showSettings: false,
    setShowSettings: noop,
  });

  const handleProgressHover = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      if (!progressRef.current || !duration) return;
      // Lazily init preview player on first seek bar hover
      ensurePreviewPlayer();
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const previewTime = (percent / 100) * duration;
      setSeekPreview({ time: previewTime, position: percent });
      if (isPreviewReady) {
        capturePreviewFrame(previewTime);
      }
    },
    [duration, capturePreviewFrame, isPreviewReady, ensurePreviewPlayer]
  );

  const handleProgressLeave = useCallback(() => {
    setSeekPreview(null);
  }, []);

  const handleSelectQuality = useCallback(
    (quality: typeof selectedQuality) => {
      selectQuality(quality, shakaRef);
    },
    [selectQuality, shakaRef]
  );

  const handleChangePlaybackSpeed = useCallback(
    (speed: number) => {
      changePlaybackSpeed(speed, videoRef, shakaRef);
    },
    [changePlaybackSpeed, videoRef, shakaRef]
  );

  const playVideoByThumbnail = useCallback(() => {
    setShowThumbnail(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  const VolumeIcon = useMemo(() => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  }, [isMuted, volume]);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label={title ? `Video player: ${title}` : 'Video player'}
      className={cn(
        'relative bg-black group select-none',
        isFullscreen ? 'fixed inset-0 z-9999' : 'aspect-video rounded-xl overflow-hidden',
        !showControls && isPlaying && 'cursor-none',
        className
      )}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => {
        setSeekPreview(null);
      }}
      onTouchStart={handleDoubleTap}
    >
      {isLoading && (
        <div className="absolute inset-0 z-20 bg-black flex items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-red-primary animate-spin" />
          </div>
        </div>
      )}

      {showThumbnail && thumbnail && (
        <button
          type="button"
          className="absolute inset-0 z-10 cursor-pointer group/thumb"
          onClick={playVideoByThumbnail}
          aria-label="Play video"
        >
          <Image
            src={thumbnail}
            alt={title || 'Video thumbnail'}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20 group-hover/thumb:bg-black/40 transition-colors duration-300" />
          <div
            className={cn(
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'w-20 h-20 rounded-full bg-red-primary/90 backdrop-blur-sm',
              'flex items-center justify-center',
              'transform transition-all duration-300',
              'group-hover/thumb:scale-110 group-hover/thumb:bg-red-primary',
              'shadow-2xl pointer-events-none'
            )}
          >
            <Play className="w-9 h-9 text-white ml-1" fill="white" />
          </div>
        </button>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        preload="auto"
        playsInline
        autoPlay={autoplay && !thumbnail}
        onClick={togglePlay}
      />

      {isBuffering && !showThumbnail && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-15">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {seekFeedback && (
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none',
            'animate-in fade-in zoom-in duration-200',
            seekFeedback.direction === 'backward' ? 'left-[15%]' : 'right-[15%]'
          )}
        >
          <div className="bg-black/70 backdrop-blur-sm rounded-full px-5 py-3 flex items-center gap-2">
            <span className="text-white text-lg font-medium">
              {seekFeedback.direction === 'backward' ? '-' : '+'}
              {seekFeedback.seconds}s
            </span>
          </div>
        </div>
      )}

      {volumeFeedback !== null && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-in fade-in zoom-in duration-200">
          <div className="bg-black/70 backdrop-blur-sm rounded-full px-5 py-3 flex items-center gap-3">
            <VolumeIcon />
            <div className="w-24 h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-150"
                style={{ width: `${volumeFeedback}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {!isPlaying && !showThumbnail && !isBuffering && (
        <button
          onClick={togglePlay}
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10',
            'w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm',
            'flex items-center justify-center',
            'opacity-0 group-hover:opacity-100 transition-all duration-300',
            'hover:bg-black/70 hover:scale-110'
          )}
        >
          <Play className="w-10 h-10 text-white ml-1" fill="white" />
        </button>
      )}

      {!showThumbnail && (
        <PlayerControls
          isPlaying={isPlaying}
          isFullscreen={isFullscreen}
          isPiP={isPiP}
          isPiPSupported={isPiPSupported}
          showControls={showControls}
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          volume={volume}
          isMuted={isMuted}
          title={title}
          availableQualities={availableQualities}
          selectedQuality={selectedQuality}
          isAutoQuality={isAutoQuality}
          playbackSpeed={playbackSpeed}
          availableCaptions={availableCaptions}
          selectedCaption={selectedCaption}
          captionsVisible={captionsVisible}
          seekPreview={seekPreview}
          previewImage={previewImage}
          thumbnail={thumbnail}
          progressRef={progressRef}
          isBunnyVideo={isBunnyVideo}
          togglePlay={togglePlay}
          toggleMute={toggleMute}
          toggleFullscreen={toggleFullscreen}
          togglePiP={togglePiP}
          handleVolumeChange={handleVolumeChange}
          seekToPercent={seekToPercent}
          onProgressHover={handleProgressHover}
          onProgressLeave={handleProgressLeave}
          onSelectCaption={handleSelectCaption}
          onDisableCaptions={handleDisableCaptions}
          onToggleCaptions={handleToggleCaptions}
          onSelectQuality={handleSelectQuality}
          onChangePlaybackSpeed={handleChangePlaybackSpeed}
        />
      )}

      <video
        ref={previewVideoRef}
        className="hidden"
        preload="auto"
        muted
        playsInline
        crossOrigin="anonymous"
      />
    </div>
  );
}
