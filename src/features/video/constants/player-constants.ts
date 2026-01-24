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

