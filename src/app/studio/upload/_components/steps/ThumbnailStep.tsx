'use client';

import { Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import type { UseFormReturn } from 'react-hook-form';
import { cn } from '@/shared/utils/formatting';
import type { UploadConfig, UploadFormData } from '../../_config/types';
import type { UseFileUploadReturn } from '../../_hooks/use-file-upload';
import { StepCard } from '../shared/StepCard';

interface ThumbnailStepProps {
  config: UploadConfig;
  form: UseFormReturn<UploadFormData>;
  fileUpload: UseFileUploadReturn;
}

/**
 * Step 3: Thumbnail upload (optional)
 * Image upload with preview
 */
export default function ThumbnailStep({ config, fileUpload }: ThumbnailStepProps) {
  const { thumbnailPreviewUrl, clearThumbnailFile, handleThumbnailChange, thumbnailInputRef } =
    fileUpload;

  const aspectClass = config.thumbnail.aspectClass;
  const sizeClass = config.type === 'video' ? 'w-64' : 'w-40';

  return (
    <StepCard
      title="Thumbnail"
      description="Upload a custom thumbnail or we'll generate one from your video"
    >
      <div className="flex gap-6 items-start">
        {thumbnailPreviewUrl ? (
          <div className={cn('relative', sizeClass, aspectClass, 'rounded-xl overflow-hidden')}>
            <Image
              src={thumbnailPreviewUrl}
              alt="Thumbnail preview"
              fill
              className="object-cover"
              data-testid="studio-thumbnail-preview"
            />
            <button
              type="button"
              onClick={clearThumbnailFile}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
              data-testid="remove-thumbnail-btn"
              aria-label="Remove thumbnail"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ) : (
          <label
            className={cn(
              sizeClass,
              aspectClass,
              'border-2 border-dashed border-border rounded-xl',
              'flex flex-col items-center justify-center cursor-pointer',
              'hover:border-red-primary/40 hover:bg-red-primary/5 transition-all'
            )}
          >
            <ImageIcon className="w-8 h-8 text-text-tertiary mb-2" />
            <span className="text-sm text-text-tertiary">Add thumbnail</span>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="sr-only"
            />
          </label>
        )}

        <div className="flex-1 text-sm text-text-secondary">
          <p className="mb-3">A good thumbnail helps your content stand out. We recommend:</p>
          <ul className="list-disc list-inside space-y-1 text-text-tertiary">
            <li>Use high-quality images</li>
            <li>
              {config.type === 'video'
                ? '16:9 aspect ratio (1280x720 recommended)'
                : '9:16 aspect ratio (1080x1920 recommended)'}
            </li>
            <li>Max file size: {config.thumbnail.maxSizeLabel}</li>
            <li>Formats: JPEG, PNG, WebP</li>
          </ul>
        </div>
      </div>
    </StepCard>
  );
}
