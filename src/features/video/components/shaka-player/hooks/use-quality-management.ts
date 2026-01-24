'use client';

import { useCallback, useState } from 'react';
import type { QualityTrack, ShakaPlayerInstance } from '../types';

interface UseQualityManagementReturn {
  availableQualities: QualityTrack[];
  selectedQuality: QualityTrack | null;
  isAutoQuality: boolean;
  playbackSpeed: number;
  updateQualityTracks: (player: ShakaPlayerInstance) => void;
  selectQuality: (quality: QualityTrack | null, shakaRef: React.RefObject<ShakaPlayerInstance | null>) => void;
  changePlaybackSpeed: (speed: number, videoRef: React.RefObject<HTMLVideoElement | null>) => void;
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

  const selectQuality = useCallback((
    quality: QualityTrack | null,
    shakaRef: React.RefObject<ShakaPlayerInstance | null>
  ) => {
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
  }, []);

  const changePlaybackSpeed = useCallback((
    speed: number,
    videoRef: React.RefObject<HTMLVideoElement | null>
  ) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  }, []);

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
