import { z } from 'zod';

export const uploadVideoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().max(5000, 'Description must be 5000 characters or less'),
  tags: z.string(),
  visibility: z.enum(['public', 'private']),
  isNsfw: z.boolean(),
});

export type UploadVideoInput = z.infer<typeof uploadVideoSchema>;

export const createPostSchema = z.object({
  caption: z
    .string()
    .min(1, 'Caption is required')
    .max(2000, 'Caption must be 2000 characters or less'),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
