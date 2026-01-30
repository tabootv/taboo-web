'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { UploadConfig, UploadFormData } from '../../_config/types';
import type { UseFileUploadReturn } from '../../_hooks/use-file-upload';
import { StepCard } from '../shared/StepCard';
import { FileDropzone } from '../shared/FileDropzone';
import { VideoPreview } from '../shared/VideoPreview';

interface VideoFileStepProps {
  config: UploadConfig;
  form: UseFormReturn<UploadFormData>;
  fileUpload: UseFileUploadReturn;
}

/**
 * Step 1: Video file upload
 * Dropzone with drag-and-drop and validation
 */
export default function VideoFileStep({ config, fileUpload }: VideoFileStepProps) {
  const {
    videoFile,
    videoPreviewUrl,
    clearVideoFile,
    handleVideoChange,
    handleVideoDrop,
    isDragging,
    setIsDragging,
    videoInputRef,
  } = fileUpload;

  const FileIcon = config.fileIcon;

  return (
    <StepCard
      title={config.type === 'video' ? 'Video File' : 'Short Video'}
      description={`Upload your ${config.type === 'video' ? 'video' : 'short'} file`}
    >
      {/* Requirements banner */}
      <div className="mb-6 p-4 rounded-xl bg-surface-hover border border-border">
        <div className="flex items-start gap-3">
          <FileIcon className="w-5 h-5 text-red-primary mt-0.5" />
          <div className="text-sm">
            <p className="text-text-primary font-medium mb-1">File Requirements</p>
            <ul className="text-text-secondary space-y-1">
              <li>Format: {config.file.fileTypeLabel}</li>
              <li>Max size: {config.file.maxFileSizeLabel}</li>
              <li>Aspect ratio: {config.file.aspectRatio}</li>
            </ul>
          </div>
        </div>
      </div>

      {!videoFile ? (
        <FileDropzone
          onDrop={handleVideoDrop}
          onFileSelect={handleVideoChange}
          accept={config.file.acceptedFileTypes}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          inputRef={videoInputRef}
          label={`Drag and drop your ${config.type === 'video' ? 'video' : 'short'} here`}
          hint={config.file.fileTypeLabel}
          icon={FileIcon}
          testId={config.type === 'video' ? 'studio-video-input' : 'studio-short-input'}
        />
      ) : (
        <VideoPreview
          previewUrl={videoPreviewUrl!}
          fileName={videoFile.name}
          fileSize={videoFile.size}
          aspectClass={config.file.aspectClass}
          onRemove={clearVideoFile}
          compact={config.type === 'short'}
          testId={config.type === 'video' ? 'studio-video-preview' : 'studio-short-preview'}
        />
      )}
    </StepCard>
  );
}
