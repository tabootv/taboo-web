'use client';

import { ThumbnailStep } from './ThumbnailStep';

interface DetailsStepProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  // Thumbnail props (rendered inline below description)
  thumbnailSource: 'auto' | 'custom';
  thumbnailPreviewUrl: string | null;
  thumbnailInputRef: React.RefObject<HTMLInputElement | null>;
  onSourceChange: (source: 'auto' | 'custom') => void;
  onThumbnailClear: () => void;
  onThumbnailSelect: (file: File) => void;
  mode?: 'upload' | 'edit';
}

/**
 * Details step for title, description, and thumbnail input
 */
export function DetailsStep({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  thumbnailSource,
  thumbnailPreviewUrl,
  thumbnailInputRef,
  onSourceChange,
  onThumbnailClear,
  onThumbnailSelect,
  mode,
}: DetailsStepProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Add a title that describes your video"
          maxLength={100}
          className="w-full px-4 py-3 border border-white/10 rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-red-primary/50 focus:border-red-primary"
        />
        <p className="text-xs text-text-tertiary mt-1 text-right">{title.length}/100</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Tell viewers about your video"
          rows={5}
          maxLength={5000}
          className="w-full px-4 py-3 border border-white/10 rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-red-primary/50 focus:border-red-primary resize-none"
        />
        <p className="text-xs text-text-tertiary mt-1 text-right">{description.length}/5000</p>
      </div>

      <ThumbnailStep
        thumbnailSource={thumbnailSource}
        thumbnailPreviewUrl={thumbnailPreviewUrl}
        thumbnailInputRef={thumbnailInputRef}
        onSourceChange={onSourceChange}
        onThumbnailClear={onThumbnailClear}
        onThumbnailSelect={onThumbnailSelect}
        mode={mode}
      />
    </>
  );
}
