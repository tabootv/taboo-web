'use client';

import { X } from 'lucide-react';
import { cn } from '@/shared/utils/formatting';

interface VideoPreviewProps {
  previewUrl: string;
  fileName: string;
  fileSize: number;
  aspectClass: string;
  onRemove: () => void;
  compact?: boolean;
  testId?: string;
}

/**
 * Video preview component with remove button
 * Displays uploaded video with controls
 */
export function VideoPreview({
  previewUrl,
  fileName,
  fileSize,
  aspectClass,
  onRemove,
  compact = false,
  testId,
}: VideoPreviewProps) {
  const fileSizeMB = (fileSize / 1024 / 1024).toFixed(1);

  if (compact) {
    return (
      <div className="flex gap-6">
        <div className="relative w-[200px] shrink-0">
          <div className={cn(aspectClass, 'rounded-xl overflow-hidden bg-black')}>
            <video
              data-testid={testId}
              src={previewUrl}
              className="w-full h-full object-cover"
              controls
            />
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
            aria-label="Remove video"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="flex-1">
          <p className="text-text-primary font-medium mb-2 truncate">{fileName}</p>
          <p className="text-sm text-text-secondary">{fileSizeMB} MB</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={cn(aspectClass, 'rounded-xl overflow-hidden bg-black')}>
        <video
          data-testid={testId}
          src={previewUrl}
          className="w-full h-full object-contain"
          controls
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
        aria-label="Remove video"
      >
        <X className="w-4 h-4 text-white" />
      </button>
      <p className="mt-3 text-sm text-text-secondary">
        {fileName} ({fileSizeMB} MB)
      </p>
    </div>
  );
}
