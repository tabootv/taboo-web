import type { ActiveUpload, UploadPhase } from '@/shared/stores/upload-store';
import type { PublishMode } from '../../config/types';

// Re-export commonly used types
export type { PublishMode, UploadPhase, ActiveUpload };

/**
 * Modal step identifiers for the upload wizard
 */
export type ModalStep = 'details' | 'location' | 'tags' | 'content-rating' | 'publishing';

/**
 * Data structure for editing existing video metadata
 */
export interface EditVideoData {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  tags?: number[];
  tagNames?: string[]; // For tag name->ID conversion
  isAdultContent?: boolean;
  visibility: 'live' | 'draft';
  isShort: boolean;
  // Location fields
  location?: string;
  countryId?: number;
  latitude?: number;
  longitude?: number;
  // Publishing fields
  publishMode?: PublishMode;
  scheduledAt?: string;
  // Thumbnail
  thumbnailUrl?: string;
  // Hidden from public listings
  hidden?: boolean;
}

/**
 * Props for the UploadModal component
 */
export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialFile?: File;
  // Edit mode props
  mode?: 'upload' | 'edit';
  editVideo?: EditVideoData;
  // Resume mode: ID for resuming an existing upload
  resumeUploadId?: string;
}
