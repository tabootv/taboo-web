'use client';

import { useCallback, useState } from 'react';
import {
  getBufferConfigForSpeed,
  RESILIENT_SPEED_CHANGE_CONFIG,
} from '../../../constants/player-constants';
import type { QualityTrack, ShakaPlayerInstance } from '../types';

interface UseQualityManagementReturn {
  availableQualities: QualityTrack[];
  selectedQuality: QualityTrack | null;
  isAutoQuality: boolean;
  playbackSpeed: number;
  updateQualityTracks: (player: ShakaPlayerInstance) => void;
  selectQuality: (
    quality: QualityTrack | null,
    shakaRef: React.RefObject<ShakaPlayerInstance | null>
  ) => void;
  changePlaybackSpeed: (
    speed: number,
    videoRef: React.RefObject<HTMLVideoElement | null>,
    shakaRef: React.RefObject<ShakaPlayerInstance | null>
  ) => void;
}

export function useQualityManagement(): UseQualityManagementReturn {
  const [availableQualities, setAvailableQualities] = useState<QualityTrack[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<QualityTrack | null>(null);
  const [isAutoQuality, setIsAutoQuality] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const updateQualityTracks = useCallback((player: ShakaPlayerInstance) => {
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
  }, []);

  const selectQuality = useCallback(
    (quality: QualityTrack | null, shakaRef: React.RefObject<ShakaPlayerInstance | null>) => {
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
    },
    []
  );

  const changePlaybackSpeed = useCallback(
    (
      speed: number,
      videoRef: React.RefObject<HTMLVideoElement | null>,
      shakaRef: React.RefObject<ShakaPlayerInstance | null>
    ) => {
      const video = videoRef.current;
      const player = shakaRef.current;
      if (!video) return;

      const bufferConfig = getBufferConfigForSpeed(speed);

      // Configure Shaka Player buffer BEFORE changing rate
      // Higher speeds consume buffer faster, so we need larger buffers
      if (player) {
        // Apply larger rebuffering goal during speed change to prevent freezing
        const rebufferingGoal = Math.max(
          bufferConfig.rebufferingGoal,
          RESILIENT_SPEED_CHANGE_CONFIG.REBUFFERING_GOAL_ON_SPEED_CHANGE
        );

        player.configure({
          streaming: {
            bufferingGoal: bufferConfig.bufferingGoal,
            rebufferingGoal,
          },
        });
      }

      // Store current time for "Flush & Seek"
      const currentTime = video.currentTime;

      // Change playback rate
      video.playbackRate = speed;

      // Perform micro-seek to force Shaka to re-anchor the stream
      // This prevents freezing on videos with poorly positioned MOOV atoms
      requestAnimationFrame(() => {
        video.currentTime = currentTime + RESILIENT_SPEED_CHANGE_CONFIG.FLUSH_SEEK_OFFSET;
      });

      // Update state outside render loop to avoid potential race conditions
      queueMicrotask(() => setPlaybackSpeed(speed));
    },
    []
  );

  return {
    availableQualities,
    selectedQuality,
    isAutoQuality,
    playbackSpeed,
    updateQualityTracks,
    selectQuality,
    changePlaybackSpeed,
  };
}
