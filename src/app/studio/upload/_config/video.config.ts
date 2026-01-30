import { FileVideo } from 'lucide-react';
import { z } from 'zod';
import type { UploadConfig } from './types';
import { getStepsForType, FORM_CONSTRAINTS, THUMBNAIL_CONSTRAINTS } from './base.config';

/**
 * Video upload form validation schema
 */
export const videoUploadSchema = z.object({
  title: z
    .string()
    .min(FORM_CONSTRAINTS.title.minLength, 'Title is required')
    .max(
      FORM_CONSTRAINTS.title.maxLength,
      `Title must be ${FORM_CONSTRAINTS.title.maxLength} characters or less`
    ),
  description: z
    .string()
    .max(
      FORM_CONSTRAINTS.description.video,
      `Description must be ${FORM_CONSTRAINTS.description.video} characters or less`
    )
    .optional()
    .default(''),
  tags: z.array(z.number()).min(FORM_CONSTRAINTS.tags.video.min, 'Select at least 2 tags'),
  location: z.string().optional().default(''),
  countryId: z.number().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  isAdultContent: z.boolean().default(false),
  publishMode: z.enum(['none', 'auto', 'scheduled']).default('none'),
  scheduledAt: z.date().nullable().optional(),
});

export type VideoUploadFormData = z.infer<typeof videoUploadSchema>;

/**
 * Video upload configuration (7 steps)
 */
export const VIDEO_CONFIG: UploadConfig = {
  type: 'video',
  title: 'Upload Video',
  subtitle: 'Share your content with your audience',

  file: {
    maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
    maxFileSizeLabel: '2GB',
    acceptedFileTypes: 'video/*',
    fileTypeLabel: 'MP4, MOV, AVI up to 2GB',
    aspectRatio: '16:9',
    aspectClass: 'aspect-video',
  },

  thumbnail: {
    maxSize: THUMBNAIL_CONSTRAINTS.maxSize,
    maxSizeLabel: THUMBNAIL_CONSTRAINTS.maxSizeLabel,
    aspectClass: 'aspect-video',
  },

  descriptionMaxLength: FORM_CONSTRAINTS.description.video,
  titleMaxLength: FORM_CONSTRAINTS.title.maxLength,
  minTags: FORM_CONSTRAINTS.tags.video.min,

  steps: getStepsForType('video'),

  fileIcon: FileVideo,
  schema: videoUploadSchema,
};
