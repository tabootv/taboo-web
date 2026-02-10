export interface SaveProgressPayload {
  position: number;
  duration: number;
  playback_speed?: number | undefined;
  last_action?: 'play' | 'pause' | 'seek' | 'complete' | 'abandon' | undefined;
}

export interface SaveProgressResponse {
  success: boolean;
  data: {
    position: number;
    duration: number;
    completed: boolean;
    first_completed_at: string | null;
    total_watch_time_seconds: number;
    rewatch_count: number;
  };
}
