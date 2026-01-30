import { Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import type { UploadConfig } from './types';

interface ThumbnailPickerProps {
  config: UploadConfig;
  thumbnailPreview: string | null;
  onThumbnailSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveThumbnail: () => void;
  thumbnailInputRef: React.RefObject<HTMLInputElement | null>;
  isInline?: boolean;
}

export function ThumbnailPicker({
  config,
  thumbnailPreview,
  onThumbnailSelect,
  onRemoveThumbnail,
  thumbnailInputRef,
  isInline = false,
}: ThumbnailPickerProps) {
  const thumbnailSizeClass = config.type === 'video' ? 'w-48 aspect-video' : 'w-24 aspect-[9/16]';

  if (isInline) {
    return (
      <div className="mt-4">
        <label className="block text-sm font-medium text-white mb-2">Custom Thumbnail</label>
        {thumbnailPreview ? (
          <div className={`relative ${thumbnailSizeClass} rounded-lg overflow-hidden`}>
            <Image src={thumbnailPreview} alt="Thumbnail" fill className="object-cover" />
            <button
              type="button"
              onClick={onRemoveThumbnail}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/60"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ) : (
          <label
            className={`${thumbnailSizeClass} border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-primary/40 transition-all`}
          >
            <ImageIcon className="w-5 h-5 text-red-primary/80 mb-1" />
            <span className="text-xs text-white/40">Add</span>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={onThumbnailSelect}
              className="hidden"
            />
          </label>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-start">
      {thumbnailPreview ? (
        <div className={`relative ${thumbnailSizeClass} rounded-lg overflow-hidden`}>
          <Image
            data-testid="studio-thumbnail-preview"
            src={thumbnailPreview}
            alt="Thumbnail preview"
            fill
            className="object-cover"
          />
          <button
            type="button"
            data-testid="remove-thumbnail-btn"
            onClick={onRemoveThumbnail}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ) : (
        <label
          className={`${thumbnailSizeClass} border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer ${config.accentColorHover} transition-all`}
        >
          <ImageIcon className="w-6 h-6 text-white/40 mb-2" />
          <span className="text-xs text-white/40">Add thumbnail</span>
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/*"
            onChange={onThumbnailSelect}
            className="hidden"
          />
        </label>
      )}
      <p className="text-sm text-white/40 flex-1">
        Upload a custom thumbnail or we&apos;ll generate one from your video.
        {config.type === 'video' && ' Recommended: 1280x720 (16:9)'}
      </p>
    </div>
  );
}
