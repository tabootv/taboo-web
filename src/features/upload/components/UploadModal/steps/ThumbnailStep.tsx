'use client';

import { cn } from '@/shared/utils/formatting';
import { ImageIcon, Upload as UploadIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { SELECTED_STYLE } from '../constants';

interface ThumbnailCustomUploadProps {
  thumbnailPreviewUrl: string | null;
  thumbnailInputRef: React.RefObject<HTMLInputElement | null>;
  onThumbnailClear: () => void;
  onThumbnailSelect: (file: File) => void;
}

/**
 * Custom thumbnail upload sub-component
 */
function ThumbnailCustomUpload({
  thumbnailPreviewUrl,
  thumbnailInputRef,
  onThumbnailClear,
  onThumbnailSelect,
}: ThumbnailCustomUploadProps): React.ReactNode {
  return (
    <div>
      {thumbnailPreviewUrl ? (
        <div className="relative">
          <img
            src={thumbnailPreviewUrl}
            alt="Custom thumbnail preview"
            className="w-full aspect-video object-cover rounded-lg border border-white/10"
          />
          <button
            type="button"
            onClick={onThumbnailClear}
            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <button
            type="button"
            onClick={() => thumbnailInputRef.current?.click()}
            className="absolute bottom-2 right-2 px-3 py-1.5 bg-black/60 hover:bg-black/80 rounded-lg text-sm text-white transition-colors"
          >
            Change
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => thumbnailInputRef.current?.click()}
          className="w-full p-8 bg-white/5 border-2 border-dashed border-white/20 rounded-lg hover:border-red-primary/40 transition-colors group"
        >
          <UploadIcon className="w-10 h-10 text-text-tertiary mx-auto mb-3 group-hover:text-red-primary transition-colors" />
          <p className="text-sm text-text-primary font-medium mb-1">Click to upload thumbnail</p>
          <p className="text-xs text-text-tertiary">
            JPG, PNG, or WebP. Max 2MB. Recommended: 1280x720
          </p>
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={thumbnailInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (file.size > 2 * 1024 * 1024) {
              toast.error('Thumbnail must be less than 2MB');
              return;
            }
            onThumbnailSelect(file);
          }
          e.target.value = '';
        }}
      />
    </div>
  );
}

interface ThumbnailStepProps {
  thumbnailSource: 'auto' | 'custom';
  thumbnailPreviewUrl: string | null;
  thumbnailInputRef: React.RefObject<HTMLInputElement | null>;
  onSourceChange: (source: 'auto' | 'custom') => void;
  onThumbnailClear: () => void;
  onThumbnailSelect: (file: File) => void;
}

/**
 * Thumbnail step for selecting thumbnail source
 */
export function ThumbnailStep({
  thumbnailSource,
  thumbnailPreviewUrl,
  thumbnailInputRef,
  onSourceChange,
  onThumbnailClear,
  onThumbnailSelect,
}: ThumbnailStepProps): React.ReactNode {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-2">Thumbnail</label>
      <p className="text-sm text-text-secondary mb-4">
        Upload a custom thumbnail or use the auto-generated one from your video.
      </p>

      {/* Thumbnail source toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => onSourceChange('auto')}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            thumbnailSource === 'auto'
              ? SELECTED_STYLE
              : 'bg-white/5 border border-white/10 text-text-secondary hover:border-white/20'
          )}
        >
          Auto-generated
        </button>
        <button
          type="button"
          onClick={() => onSourceChange('custom')}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            thumbnailSource === 'custom'
              ? SELECTED_STYLE
              : 'bg-white/5 border border-white/10 text-text-secondary hover:border-white/20'
          )}
        >
          Custom upload
        </button>
      </div>

      {thumbnailSource === 'auto' ? (
        <div className="p-6 bg-white/5 border border-white/10 rounded-lg text-center">
          <ImageIcon className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-secondary">
            A thumbnail will be automatically generated from your video after processing completes.
          </p>
        </div>
      ) : (
        <ThumbnailCustomUpload
          thumbnailPreviewUrl={thumbnailPreviewUrl}
          thumbnailInputRef={thumbnailInputRef}
          onThumbnailClear={onThumbnailClear}
          onThumbnailSelect={onThumbnailSelect}
        />
      )}
    </div>
  );
}
