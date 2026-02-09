/**
 * Video player constants
 */

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

export const STORAGE_KEYS = {
  VOLUME: 'tabootv_player_volume',
  PIP_RETURN_URL: 'tabootv_pip_return_url',
  CAPTION_LANG: 'tabootv_caption_lang',
} as const;

export const PLAYER_CONFIG = {
  CONTROLS_HIDE_DELAY: 3000,
  FEEDBACK_DISPLAY_MS: 800,
  STREAMING: {
    BUFFERING_GOAL: 15,
    REBUFFERING_GOAL: 3,
    BUFFER_BEHIND: 25,
  },
  PREVIEW: {
    BUFFERING_GOAL: 4,
    REBUFFERING_GOAL: 1,
    BUFFER_BEHIND: 5,
    MAX_HEIGHT: 720,
    THROTTLE_MS: 150,
  },
} as const;

/**
 * Speed-aware buffer configuration
 * At higher speeds, buffer drains faster (2x speed = buffer consumed 2x faster)
 * We compensate by increasing buffer goals proportionally
 */
export const SPEED_BUFFER_CONFIG: Record<
  number,
  { bufferingMultiplier: number; rebufferingMultiplier: number }
> = {
  0.5: { bufferingMultiplier: 0.75, rebufferingMultiplier: 0.75 },
  0.75: { bufferingMultiplier: 0.85, rebufferingMultiplier: 0.85 },
  1: { bufferingMultiplier: 1, rebufferingMultiplier: 1 },
  1.25: { bufferingMultiplier: 1.25, rebufferingMultiplier: 1.25 },
  1.5: { bufferingMultiplier: 1.5, rebufferingMultiplier: 1.5 },
  1.75: { bufferingMultiplier: 1.75, rebufferingMultiplier: 2 },
  2: { bufferingMultiplier: 2, rebufferingMultiplier: 2.5 },
};

/**
 * Stall recovery configuration for handling playback freezes
 */
export const STALL_RECOVERY_CONFIG = {
  STALL_DETECTION_THRESHOLD_MS: 3000,
  MAX_RECOVERY_ATTEMPTS: 3,
  RECOVERY_SEEK_OFFSET: 0.1, // seconds
  STALL_CHECK_INTERVAL_MS: 500,
} as const;

/**
 * Resilient speed change configuration
 * Prevents freezing on videos with poorly positioned MOOV atoms
 * by temporarily increasing buffer goals and forcing a stream re-anchor
 */
export const RESILIENT_SPEED_CHANGE_CONFIG = {
  REBUFFERING_GOAL_ON_SPEED_CHANGE: 10, // Temporary larger rebuffering goal
  FLUSH_SEEK_OFFSET: 0.01, // Micro-seek offset to force re-anchor (imperceptible)
} as const;

/**
 * Get buffer configuration adjusted for playback speed
 */
export function getBufferConfigForSpeed(speed: number): {
  bufferingGoal: number;
  rebufferingGoal: number;
} {
  const config = SPEED_BUFFER_CONFIG[speed] ?? SPEED_BUFFER_CONFIG[1];
  return {
    bufferingGoal: Math.ceil(PLAYER_CONFIG.STREAMING.BUFFERING_GOAL * config!.bufferingMultiplier),
    rebufferingGoal: Math.ceil(
      PLAYER_CONFIG.STREAMING.REBUFFERING_GOAL * config!.rebufferingMultiplier
    ),
  };
}
