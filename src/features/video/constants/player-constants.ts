/**
 * Video player constants
 */

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

export const STORAGE_KEYS = {
  VOLUME: 'tabootv_player_volume',
  PIP_RETURN_URL: 'tabootv_pip_return_url',
} as const;

export const PLAYER_CONFIG = {
  CONTROLS_HIDE_DELAY: 3000,
  STREAMING: {
    BUFFERING_GOAL: 3, // Lower startup buffer for faster first frame
    REBUFFERING_GOAL: 1, // Aggressive recovery target
    BUFFER_BEHIND: 15, // Smaller buffer to reduce memory and latency
  },
  PREVIEW: {
    BUFFERING_GOAL: 4,
    REBUFFERING_GOAL: 1,
    BUFFER_BEHIND: 5,
    MAX_HEIGHT: 720,
  },
} as const;
