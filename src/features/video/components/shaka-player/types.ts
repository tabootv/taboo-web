export interface QualityTrack {
  id: number;
  height: number;
  width: number;
  bandwidth: number;
  label: string;
}

export interface CaptionTrack {
  srclang: string;
  label: string;
  url: string;
}

export type SettingsPanel = 'main' | 'quality' | 'speed' | 'captions';

// Shaka Player types are not fully typed, using any for now
// Type aliases improve code readability despite SonarQube warning

// NOSONAR - Type alias improves code readability
export type ShakaPlayerInstance = any;

// NOSONAR - Type alias improves code readability
export type ShakaModule = any;

export interface PlayerNavigationControls {
  onPrevious?: (() => void) | undefined;
  onNext?: (() => void) | undefined;
  hasPrevious?: boolean | undefined;
  hasNext?: boolean | undefined;
  autoplayEnabled?: boolean | undefined;
  onAutoplayChange?: ((enabled: boolean) => void) | undefined;
}

export interface SeekFeedback {
  direction: 'forward' | 'backward';
  seconds: number;
}

export interface SeekPreview {
  time: number;
  position: number;
}
