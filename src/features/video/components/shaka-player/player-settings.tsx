'use client';

import { cn } from '@/shared/utils/formatting';
import { Check, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { PLAYBACK_SPEEDS } from '../../constants/player-constants';
import type { CaptionTrack, QualityTrack, SettingsPanel } from './types';

interface PlayerSettingsProps {
  showSettings: boolean;
  settingsPanel: SettingsPanel;
  setSettingsPanel: (panel: SettingsPanel) => void;
  setShowSettings: (show: boolean) => void;
  availableQualities: QualityTrack[];
  selectedQuality: QualityTrack | null;
  isAutoQuality: boolean;
  playbackSpeed: number;
  isBunnyVideo?: boolean | undefined;
  availableCaptions: CaptionTrack[];
  selectedCaption: CaptionTrack | null;
  captionsVisible: boolean;
  onSelectCaption: (caption: CaptionTrack) => void;
  onDisableCaptions: () => void;
  onSelectQuality: (quality: QualityTrack | null) => void;
  onChangePlaybackSpeed: (speed: number) => void;
}

export function PlayerSettings({
  showSettings,
  settingsPanel,
  setSettingsPanel,
  setShowSettings,
  availableQualities,
  selectedQuality,
  isAutoQuality,
  playbackSpeed,
  isBunnyVideo,
  availableCaptions,
  selectedCaption,
  captionsVisible,
  onSelectCaption,
  onDisableCaptions,
  onSelectQuality,
  onChangePlaybackSpeed,
}: PlayerSettingsProps) {
  const qualityLabel = useMemo(() => {
    if (isAutoQuality) return selectedQuality ? `Auto (${selectedQuality.label})` : 'Auto';
    return selectedQuality?.label || 'Auto';
  }, [isAutoQuality, selectedQuality]);

  if (!showSettings) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40"
        onClick={() => setShowSettings(false)}
        aria-label="Close settings"
      />
      <div
        className={cn(
          'absolute bottom-full right-0 mb-2 z-50',
          'bg-black/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/10',
          'min-w-[220px] overflow-hidden',
          'animate-in fade-in slide-in-from-bottom-2 duration-200'
        )}
      >
        {settingsPanel === 'main' && (
          <div className="py-2">
            {availableQualities.length > 0 && (
              <button
                onClick={() => setSettingsPanel('quality')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <span className="text-white text-sm">Quality</span>
                <div className="flex items-center gap-2 text-white/70">
                  <span className="text-sm">{qualityLabel}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            )}
            {isBunnyVideo && (
              <button
                onClick={() => setSettingsPanel('speed')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <span className="text-white text-sm">Playback speed</span>
                <div className="flex items-center gap-2 text-white/70">
                  <span className="text-sm">
                    {playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            )}
            {availableCaptions.length > 0 && (
              <button
                onClick={() => setSettingsPanel('captions')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <span className="text-white text-sm">Subtitles/CC</span>
                <div className="flex items-center gap-2 text-white/70">
                  <span className="text-sm">
                    {captionsVisible && selectedCaption ? selectedCaption.label : 'Off'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            )}
          </div>
        )}

        {settingsPanel === 'quality' && (
          <div className="py-2">
            <button
              onClick={() => setSettingsPanel('main')}
              className="w-full px-4 py-2 flex items-center gap-2 text-white/70 hover:bg-white/10 border-b border-white/10"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span className="text-sm font-medium">Quality</span>
            </button>
            <button
              onClick={() => {
                onSelectQuality(null);
                setSettingsPanel('main');
              }}
              className={cn(
                'w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors',
                isAutoQuality && 'bg-white/5'
              )}
            >
              <span className="text-white text-sm">Auto</span>
              {isAutoQuality && <Check className="w-4 h-4 text-red-primary" />}
            </button>
            {availableQualities.map((q) => (
              <button
                key={q.id}
                onClick={() => {
                  onSelectQuality(q);
                  setSettingsPanel('main');
                }}
                className={cn(
                  'w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors',
                  !isAutoQuality && selectedQuality?.height === q.height && 'bg-white/5'
                )}
              >
                <span className="text-white text-sm">{q.label}</span>
                {!isAutoQuality && selectedQuality?.height === q.height && (
                  <Check className="w-4 h-4 text-red-primary" />
                )}
              </button>
            ))}
          </div>
        )}

        {settingsPanel === 'speed' && (
          <div className="py-2">
            <button
              onClick={() => setSettingsPanel('main')}
              className="w-full px-4 py-2 flex items-center gap-2 text-white/70 hover:bg-white/10 border-b border-white/10"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span className="text-sm font-medium">Playback speed</span>
            </button>
            {PLAYBACK_SPEEDS.map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  onChangePlaybackSpeed(speed);
                  setSettingsPanel('main');
                }}
                className={cn(
                  'w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors',
                  playbackSpeed === speed && 'bg-white/5'
                )}
              >
                <span className="text-white text-sm">{speed === 1 ? 'Normal' : `${speed}x`}</span>
                {playbackSpeed === speed && <Check className="w-4 h-4 text-red-primary" />}
              </button>
            ))}
          </div>
        )}

        {settingsPanel === 'captions' && (
          <div className="py-2">
            <button
              onClick={() => setSettingsPanel('main')}
              className="w-full px-4 py-2 flex items-center gap-2 text-white/70 hover:bg-white/10 border-b border-white/10"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span className="text-sm font-medium">Subtitles/CC</span>
            </button>
            <button
              onClick={() => {
                onDisableCaptions();
                setSettingsPanel('main');
              }}
              className={cn(
                'w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors',
                !captionsVisible && 'bg-white/5'
              )}
            >
              <span className="text-white text-sm">Off</span>
              {!captionsVisible && <Check className="w-4 h-4 text-red-primary" />}
            </button>
            {availableCaptions.map((caption) => (
              <button
                key={caption.srclang}
                onClick={() => {
                  onSelectCaption(caption);
                  setSettingsPanel('main');
                }}
                className={cn(
                  'w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors',
                  captionsVisible && selectedCaption?.srclang === caption.srclang && 'bg-white/5'
                )}
              >
                <span className="text-white text-sm">{caption.label}</span>
                {captionsVisible && selectedCaption?.srclang === caption.srclang && (
                  <Check className="w-4 h-4 text-red-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
