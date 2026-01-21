'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseUpNextCountdownOptions {
  initialSeconds?: number;
  onComplete: () => void;
}

interface UseUpNextCountdownReturn {
  countdown: number;
  isActive: boolean;
  start: () => void;
  cancel: () => void;
  playNow: () => void;
}

export function useUpNextCountdown({
  initialSeconds = 5,
  onComplete,
}: UseUpNextCountdownOptions): UseUpNextCountdownReturn {
  const [countdown, setCountdown] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef(false);

  const clearCountdownInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    hasStartedRef.current = true;
    setCountdown(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  const cancel = useCallback(() => {
    clearCountdownInterval();
    hasStartedRef.current = false;
    setIsActive(false);
    setCountdown(initialSeconds);
  }, [clearCountdownInterval, initialSeconds]);

  const playNow = useCallback(() => {
    clearCountdownInterval();
    hasStartedRef.current = false;
    setIsActive(false);
    // Use setTimeout to push navigation to next tick, avoiding React render cycle issues
    setTimeout(() => {
      onComplete();
    }, 0);
  }, [clearCountdownInterval, onComplete]);

  // Interval effect - handles countdown decrement only
  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearCountdownInterval();
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearCountdownInterval;
  }, [isActive, clearCountdownInterval]);

  // Completion effect - triggers onComplete when countdown finishes
  useEffect(() => {
    if (countdown !== 0 || isActive || !hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = false;
    // Use setTimeout to push navigation to next tick, avoiding React render cycle issues
    const timer = setTimeout(() => {
      onComplete();
    }, 0);
    return () => clearTimeout(timer);
  }, [countdown, isActive, onComplete]);

  return {
    countdown,
    isActive,
    start,
    cancel,
    playNow,
  };
}
