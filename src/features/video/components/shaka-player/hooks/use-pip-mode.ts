'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { STORAGE_KEYS } from '../../../constants/player-constants';

const PIP_RETURN_URL_KEY = STORAGE_KEYS.PIP_RETURN_URL;

interface UsePiPModeParams {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

interface UsePiPModeReturn {
  isPiP: boolean;
  isPiPSupported: boolean;
  isPiPRef: React.RefObject<boolean>;
  togglePiP: () => Promise<void>;
  handleEnterPiP: () => void;
  handleLeavePiP: () => void;
}

export function usePiPMode({ videoRef }: UsePiPModeParams): UsePiPModeReturn {
  const router = useRouter();
  const pathname = usePathname();

  const [isPiP, setIsPiP] = useState(false);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const isPiPRef = useRef(false);
  const pipReturnUrlRef = useRef<string | null>(null);

  // Check PiP support on mount
  useEffect(() => {
    setIsPiPSupported(
      typeof document !== 'undefined' &&
        'pictureInPictureEnabled' in document &&
        document.pictureInPictureEnabled
    );
  }, []);

  // If user navigates away while in PiP, ensure we exit PiP when returning
  // so the new video element takes over cleanly.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const pipEl = document.pictureInPictureElement as HTMLVideoElement | null;
    if (pipEl && pipEl !== videoRef.current) {
      document.exitPictureInPicture().catch(() => {});
      setIsPiP(false);
      isPiPRef.current = false;
      sessionStorage.removeItem(PIP_RETURN_URL_KEY);
      pipReturnUrlRef.current = null;
    }
  }, [pathname, videoRef]);

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
  }, [videoRef]);

  const handleEnterPiP = useCallback(() => {
    setIsPiP(true);
    isPiPRef.current = true;
    pipReturnUrlRef.current = pathname;
    sessionStorage.setItem(PIP_RETURN_URL_KEY, pathname);
  }, [pathname]);

  const handleLeavePiP = useCallback(() => {
    setIsPiP(false);
    isPiPRef.current = false;
    const storedUrl = sessionStorage.getItem(PIP_RETURN_URL_KEY);
    if (storedUrl && storedUrl !== pathname) {
      router.push(storedUrl);
    }
    sessionStorage.removeItem(PIP_RETURN_URL_KEY);
    pipReturnUrlRef.current = null;
  }, [pathname, router]);

  return {
    isPiP,
    isPiPSupported,
    isPiPRef,
    togglePiP,
    handleEnterPiP,
    handleLeavePiP,
  };
}
