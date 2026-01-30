import type { LucideIcon } from 'lucide-react';
import type { z } from 'zod';

/**
 * Upload Types
 */
export type UploadType = 'video' | 'short';

export type PublishMode = 'none' | 'auto' | 'scheduled';

/**
 * Step Definitions
 */
export type StepId =
  | 'video-file'
  | 'details'
  | 'thumbnail'
  | 'location'
  | 'tags'
  | 'content-rating'
  | 'publishing';

export interface StepConfig {
  id: StepId;
  title: string;
  description: string;
  isOptional?: boolean;
  /** Which content types include this step */
  availableFor: UploadType[];
}

/**
 * Wizard State
 */
export type UploadPhase = 'idle' | 'preparing' | 'uploading' | 'processing' | 'complete' | 'error';

export interface WizardState {
  currentStep: number;
  completedSteps: Set<StepId>;
  uploadPhase: UploadPhase;
  uploadProgress: number;
  videoUuid: string | null;
  bunnyVideoId: string | null;
  error: string | null;
}

/**
 * Form Data (matches API prepare-bunny-upload)
 */
export interface UploadFormData {
  // Required
  title: string;

  // Optional metadata
  description: string;
  tags: number[];

  // Location
  location: string;
  countryId: number | null;
  latitude: number | null;
  longitude: number | null;

  // Content settings
  isAdultContent: boolean;

  // Publishing (video only)
  publishMode: PublishMode;
  scheduledAt: Date | null;

  // Files (handled separately, not part of form schema)
  thumbnailPath: string | null;
}

/**
 * File Constraints
 */
export interface FileConstraints {
  maxFileSize: number;
  maxFileSizeLabel: string;
  acceptedFileTypes: string;
  fileTypeLabel: string;
  aspectRatio: '16:9' | '9:16';
  aspectClass: string;
}

/**
 * Upload Configuration
 */
export interface UploadConfig {
  type: UploadType;
  title: string;
  subtitle: string;

  // File constraints
  file: FileConstraints;
  thumbnail: {
    maxSize: number;
    maxSizeLabel: string;
    aspectClass: string;
  };

  // Form constraints
  descriptionMaxLength: number;
  titleMaxLength: number;

  // Tags
  minTags: number;

  // Steps for this upload type
  steps: StepConfig[];

  // Icons
  fileIcon: LucideIcon;

  // Form validation schema
  schema: z.ZodSchema;
}

/**
 * TUS Upload Configuration (from API)
 */
export interface TusUploadConfig {
  endpoint: string;
  headers: {
    AuthorizationSignature: string;
    AuthorizationExpire: number;
    LibraryId: string | number;
    VideoId: string;
  };
}

/**
 * Prepare Upload Response
 */
export interface PrepareUploadResponse {
  video_id: number;
  video_uuid: string;
  bunny_video_id: string;
  upload_config: TusUploadConfig;
}

/**
 * Component Props
 */
export interface UploadWizardProps {
  config: UploadConfig;
}

export interface StepComponentProps {
  config: UploadConfig;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}
