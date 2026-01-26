'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PLAYER_CONFIG, STORAGE_KEYS } from '../../../constants/player-constants';
import type { ShakaModule, ShakaPlayerInstance } from '../types';

const VOLUME_STORAGE_KEY = STORAGE_KEYS.VOLUME;
const PREVIEW_THROTTLE_MS = PLAYER_CONFIG.PREVIEW.THROTTLE_MS;

interface UseShakaPlayerParams {
  src: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  previewVideoRef: React.RefObject<HTMLVideoElement | null>;
  isPiPRef: React.RefObject<boolean>;
  onQualityTracksUpdate: (player: ShakaPlayerInstance) => void;
  onProgress?: ((progress: number) => void) | undefined;
  onPlay?: (() => void) | undefined;
  onPause?: (() => void) | undefined;
  onEnded?: (() => void) | undefined;
  onEnterPiP: () => void;
  onLeavePiP: () => void;
}

interface UseShakaPlayerReturn {
  isLoading: boolean;
  isBuffering: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  isPreviewReady: boolean;
  shakaRef: React.RefObject<ShakaPlayerInstance | null>;
  previewShakaRef: React.RefObject<ShakaPlayerInstance | null>;
  capturePreviewFrame: (time: number) => void;
  previewImage: string | null;
}

export function useShakaPlayer({
  src,
  videoRef,
  previewVideoRef,
  isPiPRef,
  onQualityTracksUpdate,
  onProgress,
  onPlay,
  onPause,
  onEnded,
  onEnterPiP,
  onLeavePiP,
}: UseShakaPlayerParams): UseShakaPlayerReturn {
  const [shakaModule, setShakaModule] = useState<ShakaModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const shakaRef = useRef<ShakaPlayerInstance | null>(null);
  const previewShakaRef = useRef<ShakaPlayerInstance | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewThrottleRef = useRef<number>(0);

  // Load Shaka module dynamically
  useEffect(() => {
    let mounted = true;

    const initShaka = async () => {
      try {
        const shaka = (await import('shaka-player')) as ShakaModule;
        shaka.polyfill.installAll();

        if (!shaka.Player.isBrowserSupported()) {
          console.error('Browser not supported for Shaka Player');
          return;
        }

        if (mounted) {
          setShakaModule(shaka);
        }
      } catch (error) {
        console.error('Failed to load Shaka Player:', error);
      }
    };

    initShaka();
    return () => {
      mounted = false;
    };
  }, []);

  // Initialize main player
  useEffect(() => {
    if (!shakaModule || !videoRef.current || !src) return;

    const initPlayer = async () => {
      try {
        if (shakaRef.current) {
          await shakaRef.current.destroy();
        }

        const player = new shakaModule.Player();
        await player.attach(videoRef.current!);
        shakaRef.current = player;

        player.configure({
          streaming: {
            bufferingGoal: PLAYER_CONFIG.STREAMING.BUFFERING_GOAL,
            rebufferingGoal: PLAYER_CONFIG.STREAMING.REBUFFERING_GOAL,
            bufferBehind: PLAYER_CONFIG.STREAMING.BUFFER_BEHIND,
            lowLatencyMode: false,
            alwaysStreamText: false,
            retryParameters: {
              maxAttempts: 4,
              baseDelay: 800,
              backoffFactor: 2,
            },
          },
          abr: {
            enabled: true,
            defaultBandwidthEstimate: 3500000,
            switchInterval: 5,
            bandwidthUpgradeTarget: 0.85,
            bandwidthDowngradeTarget: 0.95,
          },
        });

        player.addEventListener('error', (event: { detail: unknown }) => {
          console.error('Shaka Player error:', event.detail);
        });

        player.addEventListener('adaptation', () => {
          onQualityTracksUpdate(player);
        });

        await player.load(src);
        onQualityTracksUpdate(player);
        setIsLoading(false);

        if (videoRef.current) {
          const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
          if (savedVolume) {
            videoRef.current.volume = Number.parseFloat(savedVolume);
          }
        }
      } catch (error) {
        console.error('Error initializing Shaka Player:', error);
        setIsLoading(false);
      }
    };

    initPlayer();

    return () => {
      if (shakaRef.current && !isPiPRef.current) {
        shakaRef.current.destroy();
        shakaRef.current = null;
      }
    };
  }, [shakaModule, src, videoRef, isPiPRef, onQualityTracksUpdate]);

  // Initialize preview player
  useEffect(() => {
    // Check if source is HLS/DASH manifest (Shaka Player only works with manifests, not direct MP4 files)
    const isManifest =
      src && (src.includes('.m3u8') || src.includes('.mpd') || src.includes('manifest'));

    if (!shakaModule || !previewVideoRef.current || !src || !isManifest) {
      // For non-manifest sources (MP4), use native video element
      if (src && !isManifest && previewVideoRef.current) {
        try {
          previewVideoRef.current.src = src;
          previewVideoRef.current.load();
          setIsPreviewReady(true);
        } catch (error) {
          console.error('Error setting up native video for MP4:', error);
        }
      }
      return;
    }

    const initPreviewPlayer = async () => {
      try {
        if (previewShakaRef.current) {
          await previewShakaRef.current.destroy();
        }

        const player = new shakaModule.Player();
        await player.attach(previewVideoRef.current!);
        previewShakaRef.current = player;

        player.configure({
          streaming: {
            bufferingGoal: PLAYER_CONFIG.PREVIEW.BUFFERING_GOAL,
            rebufferingGoal: PLAYER_CONFIG.PREVIEW.REBUFFERING_GOAL,
            bufferBehind: PLAYER_CONFIG.PREVIEW.BUFFER_BEHIND,
            retryParameters: {
              maxAttempts: 2,
              baseDelay: 500,
              backoffFactor: 2,
            },
          },
          abr: {
            enabled: true,
            defaultBandwidthEstimate: 500000,
            switchInterval: 4,
            bandwidthUpgradeTarget: 0.8,
            bandwidthDowngradeTarget: 0.9,
            restrictions: {
              maxHeight: PLAYER_CONFIG.PREVIEW.MAX_HEIGHT,
            },
          },
        });

        await player.load(src);
        setIsPreviewReady(true);
      } catch (error) {
        console.error('Error initializing preview player:', error);
      }
    };

    initPreviewPlayer();

    return () => {
      if (previewShakaRef.current && !isPiPRef.current) {
        previewShakaRef.current.destroy();
        previewShakaRef.current = null;
      }
    };
  }, [shakaModule, src, previewVideoRef, isPiPRef]);

  // Create canvas for preview frame capture
  useEffect(() => {
    previewCanvasRef.current ??= document.createElement('canvas');
    return () => {
      previewCanvasRef.current = null;
    };
  }, []);

  const capturePreviewFrame = useCallback(
    (time: number) => {
      if (!previewVideoRef.current || !previewCanvasRef.current || !isPreviewReady) {
        return;
      }

      const video = previewVideoRef.current;
      const canvas = previewCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const now = Date.now();
      if (now - previewThrottleRef.current < PREVIEW_THROTTLE_MS) return;
      previewThrottleRef.current = now;

      video.currentTime = time;

      const handleSeeked = () => {
        try {
          canvas.width = 160;
          canvas.height = 90;
          ctx.drawImage(video, 0, 0, 160, 90);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setPreviewImage(dataUrl);
        } catch (error) {
          console.error('Error capturing preview frame:', error);
          setIsPreviewReady(false);
        }
        video.removeEventListener('seeked', handleSeeked);
      };

      video.addEventListener('seeked', handleSeeked);
    },
    [previewVideoRef, isPreviewReady]
  );

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };
    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration) {
        onProgress?.(video.currentTime / video.duration);
      }
    };
    const handleDurationChange = () => setDuration(video.duration);
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
      }
    };
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('enterpictureinpicture', onEnterPiP);
    video.addEventListener('leavepictureinpicture', onLeavePiP);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('enterpictureinpicture', onEnterPiP);
      video.removeEventListener('leavepictureinpicture', onLeavePiP);
    };
  }, [videoRef, onProgress, onPlay, onPause, onEnded, onEnterPiP, onLeavePiP]);

  return {
    isLoading,
    isBuffering,
    isPlaying,
    currentTime,
    duration,
    buffered,
    isPreviewReady,
    shakaRef,
    previewShakaRef,
    capturePreviewFrame,
    previewImage,
  };
}
