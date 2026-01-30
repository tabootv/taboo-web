import type { StepConfig } from './types';

/**
 * All available steps across upload types
 * Each step can be included in video, short, or both
 */
export const ALL_STEPS: StepConfig[] = [
  {
    id: 'video-file',
    title: 'Upload your video',
    description: 'Select a video file to upload',
    availableFor: ['video', 'short'],
  },
  {
    id: 'details',
    title: 'Add title and description',
    description: 'Give your content a title and description',
    availableFor: ['video', 'short'],
  },
  {
    id: 'thumbnail',
    title: 'Upload a thumbnail',
    description: 'Add a custom thumbnail or use auto-generated',
    isOptional: true,
    availableFor: ['video', 'short'],
  },
  {
    id: 'location',
    title: 'Where was this filmed?',
    description: 'Add location information',
    availableFor: ['video', 'short'],
  },
  {
    id: 'tags',
    title: 'Select tags',
    description: 'Choose tags to help viewers find your content',
    availableFor: ['video'],
  },
  {
    id: 'content-rating',
    title: 'Content Rating',
    description: 'Is this content suitable for all audiences?',
    availableFor: ['video'],
  },
  {
    id: 'publishing',
    title: 'Publishing Options',
    description: 'Choose when to publish your video',
    availableFor: ['video'],
  },
];

/**
 * Get steps for a specific upload type
 */
export function getStepsForType(type: 'video' | 'short'): StepConfig[] {
  return ALL_STEPS.filter((step) => step.availableFor.includes(type));
}

/**
 * Shared form constraints
 */
export const FORM_CONSTRAINTS = {
  title: {
    minLength: 1,
    maxLength: 100,
  },
  description: {
    video: 5000,
    short: 500,
  },
  tags: {
    video: { min: 2 },
    short: { min: 0 },
  },
} as const;

/**
 * Thumbnail constraints (shared)
 */
export const THUMBNAIL_CONSTRAINTS = {
  maxSize: 2 * 1024 * 1024, // 2MB
  maxSizeLabel: '2MB',
  acceptedTypes: 'image/*',
} as const;
