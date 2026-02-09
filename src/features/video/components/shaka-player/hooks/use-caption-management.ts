'use client';

import { useCallback, useRef, useState } from 'react';
import { STORAGE_KEYS } from '../../../constants/player-constants';
import type { CaptionTrack, ShakaPlayerInstance } from '../types';

const CAPTION_LANG_KEY = STORAGE_KEYS.CAPTION_LANG;

interface UseCaptionManagementReturn {
  availableCaptions: CaptionTrack[];
  selectedCaption: CaptionTrack | null;
  captionsVisible: boolean;
  loadCaptions: (
    captions: CaptionTrack[],
    shakaRef: React.RefObject<ShakaPlayerInstance | null>
  ) => Promise<void>;
  selectCaption: (
    caption: CaptionTrack,
    shakaRef: React.RefObject<ShakaPlayerInstance | null>
  ) => void;
  disableCaptions: (shakaRef: React.RefObject<ShakaPlayerInstance | null>) => void;
  toggleCaptions: (shakaRef: React.RefObject<ShakaPlayerInstance | null>) => void;
}

export function useCaptionManagement(): UseCaptionManagementReturn {
  const [availableCaptions, setAvailableCaptions] = useState<CaptionTrack[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<CaptionTrack | null>(null);
  const [captionsVisible, setCaptionsVisible] = useState(false);
  const lastSelectedRef = useRef<CaptionTrack | null>(null);

  const loadCaptions = useCallback(
    async (captions: CaptionTrack[], shakaRef: React.RefObject<ShakaPlayerInstance | null>) => {
      if (!captions.length || !shakaRef.current) return;

      const player = shakaRef.current;
      setAvailableCaptions(captions);

      try {
        for (const caption of captions) {
          await player.addTextTrackAsync(
            caption.url,
            caption.srclang,
            'subtitles',
            'text/vtt',
            '',
            caption.label
          );
        }

        // Auto-select saved language preference
        const savedLang = localStorage.getItem(CAPTION_LANG_KEY);
        if (savedLang) {
          const match = captions.find((c) => c.srclang === savedLang);
          if (match) {
            const tracks = player.getTextTracks();
            const track = tracks.find((t: { language: string }) => t.language === match.srclang);
            if (track) {
              player.selectTextTrack(track);
              player.setTextTrackVisibility(true);
              setSelectedCaption(match);
              setCaptionsVisible(true);
              lastSelectedRef.current = match;
            }
          }
        }
      } catch (error) {
        console.error('Error loading captions:', error);
      }
    },
    []
  );

  const selectCaption = useCallback(
    (caption: CaptionTrack, shakaRef: React.RefObject<ShakaPlayerInstance | null>) => {
      const player = shakaRef.current;
      if (!player) return;

      const tracks = player.getTextTracks();
      const track = tracks.find((t: { language: string }) => t.language === caption.srclang);
      if (track) {
        player.selectTextTrack(track);
        player.setTextTrackVisibility(true);
        setSelectedCaption(caption);
        setCaptionsVisible(true);
        lastSelectedRef.current = caption;
        localStorage.setItem(CAPTION_LANG_KEY, caption.srclang);
      }
    },
    []
  );

  const disableCaptions = useCallback((shakaRef: React.RefObject<ShakaPlayerInstance | null>) => {
    const player = shakaRef.current;
    if (!player) return;

    player.setTextTrackVisibility(false);
    setSelectedCaption(null);
    setCaptionsVisible(false);
  }, []);

  const toggleCaptions = useCallback(
    (shakaRef: React.RefObject<ShakaPlayerInstance | null>) => {
      const player = shakaRef.current;
      if (!player || availableCaptions.length === 0) return;

      if (captionsVisible) {
        disableCaptions(shakaRef);
      } else {
        const toSelect = lastSelectedRef.current || availableCaptions[0];
        if (toSelect) {
          selectCaption(toSelect, shakaRef);
        }
      }
    },
    [availableCaptions, captionsVisible, disableCaptions, selectCaption]
  );

  return {
    availableCaptions,
    selectedCaption,
    captionsVisible,
    loadCaptions,
    selectCaption,
    disableCaptions,
    toggleCaptions,
  };
}
