'use client';

import { useState, useEffect, useCallback } from 'react';
import { videoClient } from '@/api/client/video.client';
import { useAuthStore } from '@/shared/stores/auth-store';
import posthog from 'posthog-js';
import { AnalyticsEvent } from '@/shared/lib/analytics/events';

interface AutoplayButtonProps {
  onAutoplayChange?: (enabled: boolean) => void;
  initialValue?: boolean;
}

export function AutoplayButton({ onAutoplayChange, initialValue }: AutoplayButtonProps) {
  const { user } = useAuthStore();
  const [autoplay, setAutoplay] = useState(initialValue ?? user?.video_autoplay ?? true);

  useEffect(() => {
    // Initialize with user's preference, but default to true if not set
    const userPref = user?.video_autoplay !== undefined ? user.video_autoplay : true;
    setAutoplay(initialValue ?? userPref);
    onAutoplayChange?.(initialValue ?? userPref);
  }, [user, initialValue, onAutoplayChange]);

  const toggleAutoplay = useCallback(async () => {
    const newValue = !autoplay;
    setAutoplay(newValue);
    onAutoplayChange?.(newValue);
    posthog.capture(AnalyticsEvent.VIDEO_AUTOPLAY_TOGGLED, { is_enabled: newValue });

    try {
      await videoClient.toggleAutoplay();
    } catch (error) {
      console.error('Failed to toggle autoplay:', error);
    }
  }, [autoplay, onAutoplayChange]);

  return (
    <button
      onClick={toggleAutoplay}
      className="max-w-[138px] h-7 md:h-9 rounded-full px-3 text-sm md:text-base font-normal min-w-fit flex gap-2 items-center bg-white/10 hover:bg-white/15 transition-all duration-300 cursor-pointer"
    >
      <div
        className={`w-[26px] h-[14px] relative rounded-full overflow-hidden ${
          autoplay ? 'bg-gradient-to-r from-red-primary/80 to-surface/20' : 'bg-surface'
        }`}
      >
        <div
          className={`w-[14px] h-[14px] bg-white/80 rounded-full absolute top-0 transition-all duration-200 ${
            autoplay ? 'right-0' : 'left-0'
          }`}
        />
      </div>
      <span className="text-white text-sm md:text-base">Autoplay</span>
    </button>
  );
}
