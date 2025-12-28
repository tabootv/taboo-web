'use client';

import { cn, formatDuration } from '@/lib/utils';
import {
  Check,
  ChevronRight,
  Loader2,
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
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ShakaPlayerProps {
  src: string;
  thumbnail?: string | undefined;
  title?: string | undefined;
  autoplay?: boolean | undefined;
  onProgress?: ((progress: number) => void) | undefined;
  onPlay?: (() => void) | undefined;
  onPause?: (() => void) | undefined;
  onSeek?: ((time: number) => void) | undefined;
  onEnded?: (() => void) | undefined;
  className?: string | undefined;
}

interface QualityTrack {
  id: number;
  height: number;
  width: number;
  bandwidth: number;
  label: string;
}

type SettingsPanel = 'main' | 'quality' | 'speed';

// Shaka Player types are not fully typed, using any for now
// Type aliases improve code readability despite SonarQube warning
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// NOSONAR - Type alias improves code readability
type ShakaPlayerInstance = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// NOSONAR - Type alias improves code readability
type ShakaModule = any;

import { PLAYBACK_SPEEDS, PLAYER_CONFIG, STORAGE_KEYS } from '../constants/player-constants';

const VOLUME_STORAGE_KEY = STORAGE_KEYS.VOLUME;
const CONTROLS_HIDE_DELAY = PLAYER_CONFIG.CONTROLS_HIDE_DELAY;
const PIP_RETURN_URL_KEY = STORAGE_KEYS.PIP_RETURN_URL;

export function ShakaPlayer({
  src,
  thumbnail,
  title,
  autoplay = false,
  onProgress,
  onPlay,
  onPause,
  onSeek,
  onEnded,
  className = '',
}: ShakaPlayerProps) {
  const router = useRouter();
  const pathname = usePathname();

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shakaRef = useRef<ShakaPlayerInstance | null>(null);
  const previewShakaRef = useRef<ShakaPlayerInstance | null>(null);
  const doubleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });
  const previewThrottleRef = useRef<number>(0);
  const pipReturnUrlRef = useRef<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const isPiPRef = useRef(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(!!thumbnail);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPreview, setSeekPreview] = useState<{ time: number; position: number } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>('main');
  const [availableQualities, setAvailableQualities] = useState<QualityTrack[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<QualityTrack | null>(null);
  const [isAutoQuality, setIsAutoQuality] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const [seekFeedback, setSeekFeedback] = useState<{
    direction: 'forward' | 'backward';
    seconds: number;
  } | null>(null);
  const [volumeFeedback, setVolumeFeedback] = useState<number | null>(null);

  const [shakaModule, setShakaModule] = useState<ShakaModule | null>(null);

  useEffect(() => {
    const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (savedVolume) {
      const vol = Number.parseFloat(savedVolume);
      setVolume(vol);
      setIsMuted(vol === 0);
      if (videoRef.current) {
        videoRef.current.volume = vol;
      }
    }
  }, []);

  useEffect(() => {
    setIsPiPSupported(
      typeof document !== 'undefined' &&
        'pictureInPictureEnabled' in document &&
        document.pictureInPictureEnabled
    );
  }, []);

  const saveVolume = useCallback((vol: number) => {
    localStorage.setItem(VOLUME_STORAGE_KEY, vol.toString());
  }, []);

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

  useEffect(() => {
    const videoEl = videoRef.current;
    const isManifest = src && (src.includes('.m3u8') || src.includes('.mpd') || src.includes('manifest'));

    // For MP4 / non-manifest sources, fall back to native video element
    if (videoEl && src && !isManifest) {
      videoEl.src = src;
      videoEl.load();
      setIsLoading(false);
      return;
    }

    if (!shakaModule || !videoEl || !src || !isManifest) return;

    const initPlayer = async () => {
      try {
        if (shakaRef.current) {
          await shakaRef.current.destroy();
        }

        const player = new shakaModule.Player();
        await player.attach(videoEl);
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
            defaultBandwidthEstimate: 2000000,
            switchInterval: 3,
            bandwidthUpgradeTarget: 0.85,
            bandwidthDowngradeTarget: 0.95,
          },
        });

        player.addEventListener('error', (event: { detail: unknown }) => {
          console.error('Shaka Player error:', event.detail);
        });

        player.addEventListener('adaptation', () => {
          updateQualityTracks(player);
        });

        await player.load(src);
        updateQualityTracks(player);
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
  }, [shakaModule, src]);

  useEffect(() => {
    // Check if source is HLS/DASH manifest (Shaka Player only works with manifests, not direct MP4 files)
    const isManifest =
      src && (src.includes('.m3u8') || src.includes('.mpd') || src.includes('manifest'));

    if (!isPreviewEnabled) return;
    setIsPreviewReady(false);

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
  }, [isPreviewEnabled, shakaModule, src]);

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
      if (now - previewThrottleRef.current < 150) return;
      previewThrottleRef.current = now;

      video.currentTime = time;

      const handleSeeked = () => {
        try {
          canvas.width = 160;
          canvas.height = 90;
          ctx.drawImage(video, 0, 0, 160, 90);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setPreviewImage(dataUrl);
        } catch {
          setIsPreviewReady(false);
        }
        video.removeEventListener('seeked', handleSeeked);
      };

      video.addEventListener('seeked', handleSeeked);
    },
    [isPreviewReady]
  );

  const updateQualityTracks = (player: ShakaPlayerInstance) => {
    const tracks = player.getVariantTracks();
    const uniqueHeights = new Map<number, QualityTrack>();

    tracks.forEach((track: { id: number; height?: number; width?: number; bandwidth?: number }) => {
      if (track.height && !uniqueHeights.has(track.height)) {
        uniqueHeights.set(track.height, {
          id: track.id,
          height: track.height,
          width: track.width || 0,
          bandwidth: track.bandwidth || 0,
          label: (() => {
            if (track.height >= 2160) return '4K';
            if (track.height >= 1440) return '1440p';
            return `${track.height}p`;
          })(),
        });
      }
    });

    const sortedQualities = Array.from(uniqueHeights.values()).sort((a, b) => b.height - a.height);
    setAvailableQualities(sortedQualities);

    const activeTrack = tracks.find((t: { active?: boolean }) => t.active);
    if (activeTrack?.height) {
      const currentQuality = sortedQualities.find((q) => q.height === activeTrack.height);
      if (currentQuality) setSelectedQuality(currentQuality);
    }
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, []);

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      if (!videoRef.current) return;
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      videoRef.current.volume = clampedVolume;
      setVolume(clampedVolume);
      setIsMuted(clampedVolume === 0);
      saveVolume(clampedVolume);
      setVolumeFeedback(Math.round(clampedVolume * 100));
      setTimeout(() => setVolumeFeedback(null), 800);
    },
    [saveVolume]
  );

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    if (isMuted || volume === 0) {
      const newVol = volume === 0 ? 0.5 : volume;
      videoRef.current.volume = newVol;
      setVolume(newVol);
      setIsMuted(false);
      saveVolume(newVol);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume, saveVolume]);

  const seek = useCallback(
    (seconds: number) => {
      if (!videoRef.current) return;
      const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = newTime;
      onSeek?.(newTime);
      setSeekFeedback({
        direction: seconds > 0 ? 'forward' : 'backward',
        seconds: Math.abs(seconds),
      });
      setTimeout(() => setSeekFeedback(null), 800);
    },
    [duration, onSeek]
  );

  const seekToPercent = useCallback(
    (percent: number) => {
      if (!videoRef.current || !duration) return;
      const newTime = (percent / 100) * duration;
      videoRef.current.currentTime = newTime;
      onSeek?.(newTime);
    },
    [duration, onSeek]
  );

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error('PiP error:', err);
    }
  }, []);

  const selectQuality = useCallback((quality: QualityTrack | null) => {
    if (!shakaRef.current) return;
    if (quality === null) {
      shakaRef.current.configure({ abr: { enabled: true } });
      setIsAutoQuality(true);
      setSelectedQuality(null);
    } else {
      shakaRef.current.configure({ abr: { enabled: false } });
      const tracks = shakaRef.current.getVariantTracks();
      const targetTrack = tracks.find((t: { height?: number }) => t.height === quality.height);
      if (targetTrack) {
        shakaRef.current.selectVariantTrack(targetTrack, true);
      }
      setIsAutoQuality(false);
      setSelectedQuality(quality);
    }
    setSettingsPanel('main');
  }, []);

  const changePlaybackSpeed = useCallback((speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setSettingsPanel('main');
  }, []);

  const handleProgressHover = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      if (!progressRef.current || !duration) return;
      if (!isPreviewEnabled) {
        setIsPreviewEnabled(true);
      }
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const previewTime = (percent / 100) * duration;
      setSeekPreview({ time: previewTime, position: percent });
      capturePreviewFrame(previewTime);
    },
    [duration, capturePreviewFrame, isPreviewEnabled]
  );

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying && !showSettings) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, CONTROLS_HIDE_DELAY);
    }
  }, [isPlaying, showSettings]);

  const handleDoubleTap = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const now = Date.now();
      const touch = e.touches[0] || e.changedTouches[0];
      if (!touch) return;
      const x = touch.clientX;
      const containerWidth = containerRef.current?.clientWidth || 0;

      if (now - lastTapRef.current.time < 300) {
        if (x < containerWidth / 3) {
          seek(-10);
        } else if (x > (containerWidth * 2) / 3) {
          seek(10);
        } else {
          togglePlay();
        }
      }
      lastTapRef.current = { time: now, x };
    },
    [seek, togglePlay]
  );

  const playVideoByThumbnail = useCallback(() => {
    setShowThumbnail(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

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
    const handleEnterPiP = () => {
      setIsPiP(true);
      isPiPRef.current = true;
      pipReturnUrlRef.current = pathname;
      sessionStorage.setItem(PIP_RETURN_URL_KEY, pathname);
    };
    const handleLeavePiP = () => {
      setIsPiP(false);
      isPiPRef.current = false;
      const storedUrl = sessionStorage.getItem(PIP_RETURN_URL_KEY);
      if (storedUrl && storedUrl !== pathname) {
        router.push(storedUrl);
      }
      sessionStorage.removeItem(PIP_RETURN_URL_KEY);
      pipReturnUrlRef.current = null;
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, [onProgress, onEnded]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  ]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (doubleTapTimeoutRef.current) clearTimeout(doubleTapTimeoutRef.current);
    };
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const VolumeIcon = useMemo(() => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  }, [isMuted, volume]);

  const qualityLabel = useMemo(() => {
    if (isAutoQuality) return selectedQuality ? `Auto (${selectedQuality.label})` : 'Auto';
    return selectedQuality?.label || 'Auto';
  }, [isAutoQuality, selectedQuality]);

  const handleBackdropToggle = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      // Ignore clicks on controls marked as no-toggle (progress, buttons, etc.)
      if (target.closest('[data-no-toggle]')) return;
      togglePlay();
    },
    [togglePlay]
  );

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
        if (isPlaying && !showSettings) setShowControls(false);
        setSeekPreview(null);
      }}
      onTouchStart={handleDoubleTap}
      onClick={handleBackdropToggle}
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
          onClick={(e) => {
            e.stopPropagation();
            playVideoByThumbnail();
          }}
          aria-label="Play video"
          data-no-toggle
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
      >
        <track kind="captions" />
      </video>

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
            <VolumeIcon className="w-6 h-6 text-white" />
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
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10',
            'w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm',
            'flex items-center justify-center',
            'opacity-0 group-hover:opacity-100 transition-all duration-300',
            'hover:bg-black/70 hover:scale-110'
          )}
          data-no-toggle
        >
          <Play className="w-10 h-10 text-white ml-1" fill="white" />
        </button>
      )}

      {!showThumbnail && (
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

          <div className="relative z-10 px-4 pb-2 space-y-2" data-no-toggle>
            <div ref={progressRef} className="group/progress relative h-1" data-no-toggle>
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
                onMouseMove={handleProgressHover}
                onMouseLeave={() => {
                  if (!isSeeking) {
                    setSeekPreview(null);
                    setPreviewImage(null);
                  }
                }}
                onMouseDown={() => setIsSeeking(true)}
                onMouseUp={() => setIsSeeking(false)}
              />

              {seekPreview && (
                <div
                  className="absolute z-50 pointer-events-none transform -translate-x-1/2"
                  style={{
                    left: `${seekPreview.position}%`,
                    bottom: '14px',
                  }}
                >
                  <div className="flex flex-col items-center gap-1">
                    {previewImage || thumbnail ? (
                      <div className="rounded-md overflow-hidden border border-white/15 bg-black/70 shadow-lg">
                        <img
                          src={previewImage || thumbnail}
                          alt="Preview"
                          className="w-32 h-[72px] object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="bg-black/80 text-white text-xs px-2.5 py-1 rounded-md shadow-sm tabular-nums">
                      {formatDuration(seekPreview.time)}
                    </div>
                  </div>
                </div>
              )}

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
                  data-no-toggle
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" fill="white" />
                  ) : (
                    <Play className="w-6 h-6" fill="white" />
                  )}
                </button>

                <div className="flex items-center group/vol" data-no-toggle>
                  <button
                    onClick={toggleMute}
                    className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                    data-no-toggle
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

                  {showSettings && (
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
                              onClick={() => selectQuality(null)}
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
                                onClick={() => selectQuality(q)}
                                className={cn(
                                  'w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors',
                                  !isAutoQuality &&
                                    selectedQuality?.height === q.height &&
                                    'bg-white/5'
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
                                onClick={() => changePlaybackSpeed(speed)}
                                className={cn(
                                  'w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors',
                                  playbackSpeed === speed && 'bg-white/5'
                                )}
                              >
                                <span className="text-white text-sm">
                                  {speed === 1 ? 'Normal' : `${speed}x`}
                                </span>
                                {playbackSpeed === speed && (
                                  <Check className="w-4 h-4 text-red-primary" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

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
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <video
        ref={previewVideoRef}
        className="hidden"
        preload="auto"
        muted
        playsInline
        crossOrigin="anonymous"
      />
      <canvas ref={previewCanvasRef} className="hidden" />
    </div>
  );
}
