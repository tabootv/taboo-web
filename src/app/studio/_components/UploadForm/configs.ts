import { FileVideo, Film } from 'lucide-react';
import { uploadVideoSchema, uploadShortSchema } from '@/shared/lib/validations/upload';
import type { UploadConfig } from './types';

export const VIDEO_UPLOAD_CONFIG: UploadConfig = {
  type: 'video',
  title: 'Upload Video',
  subtitle: 'Share your content with your audience',

  // File constraints
  maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
  maxFileSizeLabel: '2GB',
  acceptedFileTypes: 'video/*',
  fileTypeLabel: 'MP4, MOV, AVI up to 2GB',

  // Aspect ratio for preview
  videoAspectClass: 'aspect-video',
  thumbnailAspectClass: 'aspect-video',

  // Form constraints
  descriptionMaxLength: 5000,

  // Colors (Taboo red)
  accentColor: '[#ab0013]',
  accentColorBg: 'bg-[#ab0013]',
  accentColorHover: 'hover:border-[#ab0013]/50 hover:bg-[#ab0013]/5',
  accentColorText: 'text-[#ab0013]',

  // Progress simulation
  progressInterval: 500,
  progressIncrement: 10,

  // Icons
  fileIcon: FileVideo,

  // Form validation schema
  schema: uploadVideoSchema,

  // Upload handler
  uploadHandler: 'server-action',
};

export const SHORT_UPLOAD_CONFIG: UploadConfig = {
  type: 'short',
  title: 'Upload a Short',
  subtitle: 'Quick, vertical drops with the same Taboo polish.',

  // File constraints
  maxFileSize: 500 * 1024 * 1024, // 500MB
  maxFileSizeLabel: '500MB',
  acceptedFileTypes: 'video/*',
  fileTypeLabel: 'Vertical video (9:16) recommended • Up to 60 seconds • Max 500MB',

  // Aspect ratio for preview
  videoAspectClass: 'aspect-[9/16]',
  thumbnailAspectClass: 'aspect-[9/16]',

  // Form constraints
  descriptionMaxLength: 500,

  // Colors (purple for shorts)
  accentColor: 'purple-500',
  accentColorBg: 'bg-purple-600 hover:bg-purple-700',
  accentColorHover: 'hover:border-red-primary/40 hover:bg-red-primary/5',
  accentColorText: 'text-red-primary',

  // Progress simulation
  progressInterval: 400,
  progressIncrement: 15,

  // Icons
  fileIcon: Film,

  // Form validation schema
  schema: uploadShortSchema,

  // Upload handler
  uploadHandler: 'client',
};
