import { Calendar, FileText, Zap } from 'lucide-react';
import type { PublishMode } from './types';

/**
 * Minimum tags required for video uploads
 */
export const MIN_TAGS_FOR_VIDEO = 2;

/**
 * CSS class for selected state styling
 */
export const SELECTED_STYLE = 'bg-red-primary text-white';

/**
 * Button text for draft save action
 */
export const SAVE_AS_DRAFT = 'Save as Draft';

/**
 * Publishing option configuration for the PublishingStep
 */
export interface PublishOption {
  value: PublishMode;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  liveTitle: string;
  description: string;
  liveDescription: string;
  disabledForLive: boolean;
}

export const PUBLISH_OPTIONS: PublishOption[] = [
  {
    value: 'none',
    icon: FileText,
    title: SAVE_AS_DRAFT,
    liveTitle: SAVE_AS_DRAFT,
    description: 'Keep private and publish later from your studio',
    liveDescription: 'Keep private and publish later from your studio',
    disabledForLive: true,
  },
  {
    value: 'auto',
    icon: Zap,
    title: 'Publish Now',
    liveTitle: 'Published',
    description: 'Make public as soon as processing completes',
    liveDescription: 'This video is currently live and public',
    disabledForLive: false,
  },
  {
    value: 'scheduled',
    icon: Calendar,
    title: 'Schedule',
    liveTitle: 'Schedule',
    description: 'Set a specific date and time to go public',
    liveDescription: 'Set a specific date and time to go public',
    disabledForLive: true,
  },
];
