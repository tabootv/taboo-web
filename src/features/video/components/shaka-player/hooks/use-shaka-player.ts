'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PLAYER_CONFIG,
  STALL_RECOVERY_CONFIG,
  STORAGE_KEYS,
} from '../../../constants/player-constants';
import type { ShakaModule, ShakaPlayerInstance } from '../types';

const VOLUME_STORAGE_KEY = STORAGE_KEYS.VOLUME;
const PREVIEW_THROTTLE_MS = PLAYER_CONFIG.PREVIEW.THROTTLE_MS;
const DURATION_CORRUPTION_THRESHOLD = 0.9; // new < 90% of known-good = corruption
const SEEK_CORRUPTION_WINDOW_MS = 5000; // detect corruption within 5s of a seek

interface UseShakaPlayerParams {
  src: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  previewVideoRef: React.RefObject<HTMLVideoElement | null>;
  isPiPRef: React.RefObject<boolean>;
  onQualityTracksUpdate: (player: ShakaPlayerInstance) => void;
  onProgress?: ((progress: number) => void) | undefined;
  onTimeUpdate?: ((currentTime: number, duration: number) => void) | undefined;
  onPlay?: (() => void) | undefined;
  onPause?: (() => void) | undefined;
  onEnded?: (() => void) | undefined;
  onSeekFailed?: ((targetTime: number) => void) | undefined;
  onEnterPiP: () => void;
  onLeavePiP: () => void;
  initialPosition?: number | undefined;
  onLoaded?: ((player: ShakaPlayerInstance) => void) | undefined;
  isRecoveryLoad?: boolean | undefined;
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
  ensurePreviewPlayer: () => Promise<void>;
}

export function useShakaPlayer({
  src,
  videoRef,
  previewVideoRef,
  isPiPRef,
  onQualityTracksUpdate,
  onProgress,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  onSeekFailed,
  onEnterPiP,
  onLeavePiP,
  initialPosition,
  onLoaded,
  isRecoveryLoad,
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
  const hasResumedRef = useRef(false);
  const recoveryTargetRef = useRef<number>(0);
  const sourceLoadingRef = useRef(false);

  // MP4 stco corruption tracking — refs survive effect re-runs
  const knownGoodDurationRef = useRef(0);
  const durationCorruptedRef = useRef(false);
  const isRecoveryLoadRef = useRef(false);
  isRecoveryLoadRef.current = isRecoveryLoad ?? false;

  // Detect whether the source is an HLS/DASH manifest (requires Shaka) or a plain MP4
  const isManifestSrc =
    !!src && (src.includes('.m3u8') || src.includes('.mpd') || src.includes('manifest'));

  // Load Shaka module dynamically — only for HLS/DASH sources
  useEffect(() => {
    if (!isManifestSrc) return;

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
  }, [isManifestSrc]);

  // Initialize main player
  useEffect(() => {
    if (!videoRef.current || !src) return;

    // MP4-only fast path: skip Shaka entirely, use native <video>
    if (!isManifestSrc) {
      // Reset corruption tracking for genuine new-video loads, preserve for recovery fallbacks
      if (!isRecoveryLoadRef.current) {
        knownGoodDurationRef.current = 0;
        durationCorruptedRef.current = false;
        recoveryTargetRef.current = 0;
      }
      sourceLoadingRef.current = true;
      videoRef.current.src = src;
      videoRef.current.load();
      setIsLoading(false);

      const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
      if (savedVolume) {
        videoRef.current.volume = Number.parseFloat(savedVolume);
      }

      if (initialPosition && initialPosition > 0 && !hasResumedRef.current) {
        recoveryTargetRef.current = initialPosition;
        videoRef.current.currentTime = initialPosition;
        hasResumedRef.current = true;
      }

      return;
    }

    // HLS/DASH: full Shaka Player init
    if (!shakaModule) return;

    const initPlayer = async () => {
      try {
        if (shakaRef.current) {
          await shakaRef.current.destroy();
        }

        const player = new shakaModule.Player();
        await player.attach(videoRef.current!);
        shakaRef.current = player;

        // Use aggressive fast-start config for quick first frame, then relax
        player.configure({
          streaming: {
            bufferingGoal: PLAYER_CONFIG.FAST_START.BUFFERING_GOAL,
            rebufferingGoal: PLAYER_CONFIG.FAST_START.REBUFFERING_GOAL,
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

        // Expand buffer to steady-state values after first canplay
        videoRef.current!.addEventListener(
          'canplay',
          () => {
            player.configure({
              streaming: {
                bufferingGoal: PLAYER_CONFIG.STREAMING.BUFFERING_GOAL,
                rebufferingGoal: PLAYER_CONFIG.STREAMING.REBUFFERING_GOAL,
              },
            });
          },
          { once: true }
        );

        await player.load(src);
        onQualityTracksUpdate(player);
        setIsLoading(false);

        if (videoRef.current) {
          const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
          if (savedVolume) {
            videoRef.current.volume = Number.parseFloat(savedVolume);
          }

          if (initialPosition && initialPosition > 0 && !hasResumedRef.current) {
            videoRef.current.currentTime = initialPosition;
            hasResumedRef.current = true;
          }
        }

        onLoaded?.(player);
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
    // Note: initialPosition and onLoaded intentionally excluded from deps
    // - initialPosition is only used on first load (guarded by hasResumedRef)
    // - onLoaded is a callback that should only fire once per load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shakaModule, src, videoRef, isPiPRef, isManifestSrc, onQualityTracksUpdate]);

  // Lazy preview player init — only runs when seek bar is hovered
  const previewInitRef = useRef(false);

  // Reset preview init state when src changes
  useEffect(() => {
    previewInitRef.current = false;
    setIsPreviewReady(false);
  }, [src]);

  const ensurePreviewPlayer = useCallback(async () => {
    if (previewInitRef.current || !previewVideoRef.current || !src) return;
    previewInitRef.current = true;

    // MP4: use native video element directly
    if (!isManifestSrc) {
      try {
        // Cache-bust the preview URL to prevent the browser from sharing internal
        // buffer/cache state between the main and preview <video> elements.
        const previewSrc = src + (src.includes('?') ? '&' : '?') + '_preview=1';
        previewVideoRef.current.src = previewSrc;
        previewVideoRef.current.load();
        setIsPreviewReady(true);
      } catch (error) {
        console.error('Error setting up native preview for MP4:', error);
      }
      return;
    }

    // HLS/DASH: full Shaka preview player
    if (!shakaModule) return;

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
  }, [shakaModule, src, previewVideoRef, isManifestSrc]);

  // Cleanup preview player on unmount
  useEffect(() => {
    return () => {
      if (previewShakaRef.current && !isPiPRef.current) {
        previewShakaRef.current.destroy();
        previewShakaRef.current = null;
      }
    };
  }, [isPiPRef]);

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

  // Video event listeners with stall detection and recovery
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Stall detection state
    let stallCheckInterval: ReturnType<typeof setInterval> | null = null;
    let lastPlaybackPosition = 0;
    let stallStartTime: number | null = null;
    let recoveryAttempts = 0;

    // Track user-initiated seeks to prevent autoplay navigation when seeking near the end.
    // When the user drags the progress bar close to the end, the native "ended" event fires
    // almost immediately. Without this guard, the onEnded callback triggers router.push()
    // to the next video — making it look like clicking the progress bar redirects away.
    let userSeekedAt = 0;
    let lastSeekTarget = 0;
    let spuriousEndRecovering = false;
    const SEEK_ENDED_GRACE_MS = 1500;

    const clearStallInterval = () => {
      if (stallCheckInterval) {
        clearInterval(stallCheckInterval);
        stallCheckInterval = null;
      }
    };

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
      // Use knownGoodDuration when the browser's duration is corrupted
      const safeDuration = durationCorruptedRef.current
        ? knownGoodDurationRef.current
        : video.duration;
      if (safeDuration > 0) {
        onProgress?.(video.currentTime / safeDuration);
        onTimeUpdate?.(video.currentTime, safeDuration);
      }
    };

    const handleDurationChange = () => {
      const newDuration = video.duration;

      // Ignore NaN/Infinity (common during load)
      if (!Number.isFinite(newDuration) || newDuration <= 0) return;

      const timeSinceSeek = Date.now() - userSeekedAt;
      const seekedRecently = timeSinceSeek < SEEK_CORRUPTION_WINDOW_MS;
      const durationDropped =
        knownGoodDurationRef.current > 0 &&
        newDuration < knownGoodDurationRef.current * DURATION_CORRUPTION_THRESHOLD;

      if (
        durationDropped &&
        seekedRecently &&
        !durationCorruptedRef.current &&
        !sourceLoadingRef.current
      ) {
        // MP4 stco 32-bit overflow: browser's MP4 parser hit the 4GB boundary
        // and reported a truncated duration. Block the corrupted value.
        durationCorruptedRef.current = true;

        if (onSeekFailed) {
          onSeekFailed(lastSeekTarget);
        } else {
          // Emergency fallback: no parent handler, reset player
          video.currentTime = 0;
          video.pause();
          setIsPlaying(false);
        }
        return; // Do NOT call setDuration with the corrupted value
      }

      // Normal case: duration stable or increased (e.g. progressive download)
      if (newDuration > knownGoodDurationRef.current) {
        knownGoodDurationRef.current = newDuration;
      }
      durationCorruptedRef.current = false;
      setDuration(newDuration);
    };
    const handleProgress = () => {
      const safeDuration = durationCorruptedRef.current
        ? knownGoodDurationRef.current
        : video.duration;
      if (video.buffered.length > 0 && Number.isFinite(safeDuration) && safeDuration > 0) {
        setBuffered((video.buffered.end(video.buffered.length - 1) / safeDuration) * 100);
      }
    };

    const handleWaiting = () => {
      setIsBuffering(true);
      stallStartTime = Date.now();

      // Start monitoring for extended stalls
      if (!stallCheckInterval) {
        stallCheckInterval = setInterval(() => {
          if (video.paused || video.ended) {
            clearStallInterval();
            return;
          }

          const currentPosition = video.currentTime;
          if (currentPosition === lastPlaybackPosition && stallStartTime) {
            const stallDuration = Date.now() - stallStartTime;
            if (
              stallDuration > STALL_RECOVERY_CONFIG.STALL_DETECTION_THRESHOLD_MS &&
              recoveryAttempts < STALL_RECOVERY_CONFIG.MAX_RECOVERY_ATTEMPTS
            ) {
              // Recovery: small seek to force buffer refresh
              video.currentTime = currentPosition + STALL_RECOVERY_CONFIG.RECOVERY_SEEK_OFFSET;
              recoveryAttempts++;
              stallStartTime = Date.now(); // Reset stall timer after recovery attempt
            }
          }
          lastPlaybackPosition = currentPosition;
        }, STALL_RECOVERY_CONFIG.STALL_CHECK_INTERVAL_MS);
      }
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
      stallStartTime = null;
      recoveryAttempts = 0;
      clearStallInterval();
    };

    const handleSeeking = () => {
      // Don't update seek tracking for our own recovery seek
      if (spuriousEndRecovering) return;
      userSeekedAt = Date.now();
      lastSeekTarget = video.currentTime;
    };

    const handleEnded = () => {
      const timeSinceSeek = Date.now() - userSeekedAt;
      const isSpuriousEnd = timeSinceSeek < SEEK_ENDED_GRACE_MS;

      if (isSpuriousEnd) {
        // Browser couldn't seek (broken MP4 index, likely stco 32-bit overflow
        // on >4GB files) and jumped to end.
        if (onSeekFailed) {
          onSeekFailed(lastSeekTarget);
        }
        // Always reset to safe state — if parent loads new quality, init effect overrides
        spuriousEndRecovering = true;
        video.currentTime = 0;
        video.pause();
        setIsPlaying(false);
        clearStallInterval();
        return;
      }

      // Genuine end of video
      setIsPlaying(false);
      clearStallInterval();
      onEnded?.();
    };

    const handleSeeked = () => {
      if (spuriousEndRecovering) {
        spuriousEndRecovering = false;
      }
    };

    const handleStalled = () => {
      // 'stalled' event fires when the browser is trying to fetch data but none is available
      // Start monitoring if not already
      if (!stallStartTime) {
        stallStartTime = Date.now();
      }
    };

    const handleRateChange = () => {
      // Reset recovery attempts when rate changes, as buffer config should have been updated
      recoveryAttempts = 0;
    };

    const handleError = () => {};

    const handleLoadedMetadata = () => {
      const dur = video.duration;
      if (!Number.isFinite(dur) || dur <= 0) return;

      sourceLoadingRef.current = false;

      // Detect stco corruption in fallback: new duration << known-good
      if (
        knownGoodDurationRef.current > 0 &&
        dur < knownGoodDurationRef.current * DURATION_CORRUPTION_THRESHOLD
      ) {
        durationCorruptedRef.current = true;
        video.pause();
        video.currentTime = 0;
        hasResumedRef.current = false; // Allow next fallback to seek
        const target = recoveryTargetRef.current || lastSeekTarget;
        if (target > 0) onSeekFailed?.(target);
        return; // Don't update knownGoodDuration with corrupted value
      }

      // Normal: only increase knownGoodDuration
      if (dur > knownGoodDurationRef.current) {
        knownGoodDurationRef.current = dur;
      }
      durationCorruptedRef.current = false;
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('ratechange', handleRateChange);
    video.addEventListener('error', handleError);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
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
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('ratechange', handleRateChange);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('enterpictureinpicture', onEnterPiP);
      video.removeEventListener('leavepictureinpicture', onLeavePiP);
      clearStallInterval();
    };
  }, [
    videoRef,
    onProgress,
    onTimeUpdate,
    onPlay,
    onPause,
    onEnded,
    onSeekFailed,
    onEnterPiP,
    onLeavePiP,
  ]);

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
    ensurePreviewPlayer,
  };
}
