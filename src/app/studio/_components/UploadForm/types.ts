import type { LucideIcon } from 'lucide-react';
import type { z } from 'zod';
import type { uploadVideoSchema, uploadShortSchema } from '@/shared/lib/validations/upload';

export type UploadType = 'video' | 'short';

type VideoSchema = typeof uploadVideoSchema;
type ShortSchema = typeof uploadShortSchema;

export interface UploadConfig {
  type: UploadType;
  title: string;
  subtitle: string;

  // File constraints
  maxFileSize: number; // in bytes
  maxFileSizeLabel: string;
  acceptedFileTypes: string;
  fileTypeLabel: string;

  // Aspect ratio for preview
  videoAspectClass: string;
  thumbnailAspectClass: string;

  // Form constraints
  descriptionMaxLength: number;

  // Colors (using Tailwind classes)
  accentColor: string;
  accentColorBg: string;
  accentColorHover: string;
  accentColorText: string;

  // Progress simulation
  progressInterval: number;
  progressIncrement: number;

  // Icons
  fileIcon: LucideIcon;

  // Form validation schema
  schema: VideoSchema | ShortSchema;

  // Upload handler type
  uploadHandler: 'server-action' | 'client';
}

// Infer the form input type from schema
export type UploadFormInput = z.infer<VideoSchema>;

export interface UploadFormProps {
  config: UploadConfig;
  tipsBanner?: React.ReactNode;
}
