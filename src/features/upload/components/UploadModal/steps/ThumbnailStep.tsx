'use client';

import { cn } from '@/shared/utils/formatting';
import { Sparkles, Upload as UploadIcon, X } from 'lucide-react';
import { toast } from 'sonner';

interface ThumbnailStepProps {
  thumbnailSource: 'auto' | 'custom';
  thumbnailPreviewUrl: string | null;
  thumbnailInputRef: React.RefObject<HTMLInputElement | null>;
  onSourceChange: (source: 'auto' | 'custom') => void;
  onThumbnailClear: () => void;
  onThumbnailSelect: (file: File) => void;
  mode?: 'upload' | 'edit' | undefined;
}

const cardBase =
  'min-w-0 min-h-[80px] aspect-video rounded-lg transition-colors cursor-pointer overflow-hidden';
const cardUnselected = 'border-2 border-dashed border-white/20 hover:border-white/40';
const cardSelected = 'border-2 border-solid border-red-primary';

export function ThumbnailStep({
  thumbnailSource,
  thumbnailPreviewUrl,
  thumbnailInputRef,
  onSourceChange,
  onThumbnailClear,
  onThumbnailSelect,
  mode = 'upload',
}: ThumbnailStepProps): React.ReactNode {
  const isCustom = thumbnailSource === 'custom';
  const isAuto = thumbnailSource === 'auto';

  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-2">Thumbnail</label>
      <p className="text-sm text-text-secondary mb-4">
        Upload a custom thumbnail or use the auto-generated one from your video.
      </p>

      <div className="flex gap-3">
        {/* Custom Upload Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            onSourceChange('custom');
            if (!thumbnailPreviewUrl) {
              thumbnailInputRef.current?.click();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSourceChange('custom');
              if (!thumbnailPreviewUrl) {
                thumbnailInputRef.current?.click();
              }
            }
          }}
          className={cn(
            cardBase,
            'relative flex flex-col items-center justify-center max-w-[50%]',
            isCustom ? cardSelected : cardUnselected
          )}
        >
          {thumbnailPreviewUrl ? (
            <>
              <img
                src={thumbnailPreviewUrl}
                alt="Custom thumbnail preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onThumbnailClear();
                }}
                className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 rounded-full transition-colors z-10"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </>
          ) : (
            <>
              <UploadIcon className="w-6 h-6 text-text-tertiary mb-2" />
              <span className="text-sm text-text-tertiary">Upload File</span>
            </>
          )}
        </div>

        {/* Auto-generated Card — only in upload mode */}
        {mode !== 'edit' && (
          <button
            type="button"
            onClick={() => onSourceChange('auto')}
            className={cn(
              cardBase,
              'max-w-[50%] flex flex-col items-center justify-center',
              isAuto ? cardSelected : cardUnselected
            )}
          >
            <Sparkles className="w-6 h-6 text-text-tertiary mb-2" />
            <span className="text-sm text-text-tertiary">Auto-generated</span>
          </button>
        )}
      </div>

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
