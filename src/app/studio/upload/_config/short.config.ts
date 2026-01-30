import { Film } from 'lucide-react';
import { z } from 'zod';
import type { UploadConfig } from './types';
import { getStepsForType, FORM_CONSTRAINTS, THUMBNAIL_CONSTRAINTS } from './base.config';

/**
 * Short upload form validation schema
 */
export const shortUploadSchema = z.object({
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
      FORM_CONSTRAINTS.description.short,
      `Description must be ${FORM_CONSTRAINTS.description.short} characters or less`
    )
    .optional()
    .default(''),
  tags: z.array(z.number()).optional().default([]),
  location: z.string().optional().default(''),
  countryId: z.number().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  isAdultContent: z.boolean().default(false),
  // Shorts don't have publish modes - always draft
  publishMode: z.literal('none').default('none'),
  scheduledAt: z.null().optional(),
});

export type ShortUploadFormData = z.infer<typeof shortUploadSchema>;

/**
 * Short upload configuration (4 steps)
 */
export const SHORT_CONFIG: UploadConfig = {
  type: 'short',
  title: 'Upload a Short',
  subtitle: 'Quick, vertical drops with the same Taboo polish.',

  file: {
    maxFileSize: 500 * 1024 * 1024, // 500MB
    maxFileSizeLabel: '500MB',
    acceptedFileTypes: 'video/*',
    fileTypeLabel: 'Vertical video (9:16) recommended - Up to 60 seconds - Max 500MB',
    aspectRatio: '9:16',
    aspectClass: 'aspect-[9/16]',
  },

  thumbnail: {
    maxSize: THUMBNAIL_CONSTRAINTS.maxSize,
    maxSizeLabel: THUMBNAIL_CONSTRAINTS.maxSizeLabel,
    aspectClass: 'aspect-[9/16]',
  },

  descriptionMaxLength: FORM_CONSTRAINTS.description.short,
  titleMaxLength: FORM_CONSTRAINTS.title.maxLength,
  minTags: FORM_CONSTRAINTS.tags.short.min,

  steps: getStepsForType('short'),

  fileIcon: Film,
  schema: shortUploadSchema,
};
