'use client';

import { useEffect } from 'react';

interface UseKeyboardShortcutsParams {
  togglePlay: () => void;
  toggleFullscreen: () => void | Promise<void>;
  toggleMute: () => void;
  togglePiP: () => void | Promise<void>;
  seek: (seconds: number) => void;
  seekToPercent: (percent: number) => void;
  volume: number;
  handleVolumeChange: (volume: number) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
}

export function useKeyboardShortcuts({
  togglePlay,
  toggleFullscreen,
  toggleMute,
  togglePiP,
  seek,
  seekToPercent,
  volume,
  handleVolumeChange,
  showSettings,
  setShowSettings,
}: UseKeyboardShortcutsParams) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();

      switch (key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'j':
        case 'arrowleft':
          e.preventDefault();
          seek(-10);
          break;
        case 'l':
        case 'arrowright':
          e.preventDefault();
          seek(10);
          break;
        case 'arrowup':
          e.preventDefault();
          handleVolumeChange(volume + 0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange(volume - 0.1);
          break;
        case 'p':
          if (e.shiftKey) {
            e.preventDefault();
            togglePiP();
          }
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault();
          seekToPercent(Number.parseInt(key, 10) * 10);
          break;
        case ',':
          e.preventDefault();
          seek(-5);
          break;
        case '.':
          e.preventDefault();
          seek(5);
          break;
        case 'escape':
          if (showSettings) {
            setShowSettings(false);
          }
          break;
      }
    };

    globalThis.window.addEventListener('keydown', handleKeyDown);
    return () => globalThis.window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    toggleFullscreen,
    toggleMute,
    togglePiP,
    seek,
    seekToPercent,
    volume,
    handleVolumeChange,
    showSettings,
    setShowSettings,
  ]);
}
