'use client';

import { cn, formatDuration } from '@/shared/utils/formatting';
import {
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  Settings,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { PlayerSettings } from './player-settings';
import { SeekPreview } from './seek-preview';
import type { QualityTrack, SeekPreview as SeekPreviewType, SettingsPanel } from './types';

interface PlayerControlsProps {
  isPlaying: boolean;
  isFullscreen: boolean;
  isPiP: boolean;
  isPiPSupported: boolean;
  showControls: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  isMuted: boolean;
  title?: string | undefined;

  availableQualities: QualityTrack[];
  selectedQuality: QualityTrack | null;
  isAutoQuality: boolean;
  playbackSpeed: number;

  seekPreview: SeekPreviewType | null;
  previewImage: string | null;
  thumbnail?: string | undefined;
  isBunnyVideo?: boolean | undefined;

  progressRef: React.RefObject<HTMLDivElement | null>;

  togglePlay: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  togglePiP: () => void;
  handleVolumeChange: (volume: number) => void;
  seekToPercent: (percent: number) => void;
  onProgressHover: (e: React.MouseEvent<HTMLInputElement>) => void;
  onProgressLeave: () => void;
  onSelectQuality: (quality: QualityTrack | null) => void;
  onChangePlaybackSpeed: (speed: number) => void;
}

export function PlayerControls({
  isPlaying,
  isFullscreen,
  isPiP,
  isPiPSupported,
  showControls,
  currentTime,
  duration,
  buffered,
  volume,
  isMuted,
  title,
  availableQualities,
  selectedQuality,
  isAutoQuality,
  playbackSpeed,
  seekPreview,
  previewImage,
  thumbnail,
  isBunnyVideo,
  progressRef,
  togglePlay,
  toggleMute,
  toggleFullscreen,
  togglePiP,
  handleVolumeChange,
  seekToPercent,
  onProgressHover,
  onProgressLeave,
  onSelectQuality,
  onChangePlaybackSpeed,
}: PlayerControlsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>('main');
  const [isSeeking, setIsSeeking] = useState(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const VolumeIcon = useMemo(() => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  }, [isMuted, volume]);

  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col justify-end transition-opacity duration-300',
        showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-black/60 to-transparent pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

      {isFullscreen && title && (
        <div className="absolute top-0 left-0 right-0 p-6">
          <h2 className="text-white text-xl font-semibold drop-shadow-lg">{title}</h2>
        </div>
      )}

      <div className="relative z-10 px-4 pb-2 space-y-2">
        <div ref={progressRef} className="group/progress relative h-1">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            aria-label="Video progress"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={(e) => {
              const percent = Number.parseFloat(e.target.value);
              seekToPercent(percent);
            }}
            onMouseMove={onProgressHover}
            onMouseLeave={() => {
              if (!isSeeking) {
                onProgressLeave();
              }
            }}
            onMouseDown={() => setIsSeeking(true)}
            onMouseUp={() => setIsSeeking(false)}
          />

          <SeekPreview
            seekPreview={seekPreview}
            previewImage={previewImage}
            thumbnail={thumbnail}
          />

          <div className="absolute inset-0 bg-white/12 rounded-full overflow-hidden pointer-events-none">
            <div
              className="absolute h-full bg-white/20 rounded-full transition-all duration-300"
              style={{ width: `${buffered}%` }}
            />
            <div
              className="absolute h-full bg-red-primary/80 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none',
              'w-2.5 h-2.5 bg-red-primary rounded-full shadow-sm',
              'opacity-0 group-hover/progress:opacity-100 transition-all duration-150',
              isSeeking && 'opacity-100'
            )}
            style={{ left: `${progress}%` }}
          />

          {seekPreview && (
            <div
              className="absolute top-0 bottom-0 w-px bg-white/30 pointer-events-none"
              style={{ left: `${seekPreview.position}%` }}
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={togglePlay}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" fill="white" />
              ) : (
                <Play className="w-6 h-6" fill="white" />
              )}
            </button>

            <div className="flex items-center group/vol">
              <button
                onClick={toggleMute}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <VolumeIcon className="w-5 h-5" />
              </button>
              <div className="w-0 overflow-hidden group-hover/vol:w-16 transition-all duration-200">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number.parseFloat(e.target.value))}
                  className="w-full h-0.5 bg-white/25 rounded-full appearance-none cursor-pointer mx-1.5
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5
                    [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:hover:scale-110"
                  style={{
                    background: `linear-gradient(to right, white ${
                      (isMuted ? 0 : volume) * 100
                    }%, rgba(255,255,255,0.25) ${(isMuted ? 0 : volume) * 100}%)`,
                  }}
                />
              </div>
            </div>

            <div className="text-white text-sm font-medium px-2 tabular-nums">
              <span>{formatDuration(currentTime)}</span>
              <span className="text-white/60 mx-1">/</span>
              <span className="text-white/60">{formatDuration(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Only show settings button if there are options (quality or speed) */}
            {(availableQualities.length > 0 || isBunnyVideo) && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSettings(!showSettings);
                    setSettingsPanel('main');
                  }}
                  className={cn(
                    'p-2 text-white hover:bg-white/10 rounded-lg transition-all',
                    showSettings && 'bg-white/10'
                  )}
                >
                  <Settings
                    className={cn(
                      'w-5 h-5 transition-transform duration-300',
                      showSettings && 'rotate-90'
                    )}
                  />
                </button>

                <PlayerSettings
                  showSettings={showSettings}
                  settingsPanel={settingsPanel}
                  setSettingsPanel={setSettingsPanel}
                  setShowSettings={setShowSettings}
                  availableQualities={availableQualities}
                  selectedQuality={selectedQuality}
                  isAutoQuality={isAutoQuality}
                  playbackSpeed={playbackSpeed}
                  isBunnyVideo={isBunnyVideo}
                  onSelectQuality={onSelectQuality}
                  onChangePlaybackSpeed={onChangePlaybackSpeed}
                />
              </div>
            )}

            {isPiPSupported && (
              <button
                onClick={togglePiP}
                className={cn(
                  'p-2 text-white hover:bg-white/10 rounded-lg transition-colors',
                  isPiP && 'bg-white/20'
                )}
                title="Picture in Picture (Shift+P)"
              >
                <PictureInPicture2 className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
