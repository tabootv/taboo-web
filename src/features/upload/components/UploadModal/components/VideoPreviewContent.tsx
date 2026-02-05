'use client';

import type { ActiveUpload } from '@/shared/stores/upload-store';
import { Clapperboard, Film } from 'lucide-react';
import type { EditVideoData } from '../types';
import { StaleUploadPreview } from './StaleUploadPreview';

interface VideoPreviewContentProps {
  videoPreviewUrl: string | null;
  mode: 'upload' | 'edit';
  editVideo: EditVideoData | undefined;
  storeUpload: ActiveUpload | undefined;
  isShort: boolean;
  onFileReselected: (file: File) => void;
}

/**
 * Renders video preview content based on state
 */
export function VideoPreviewContent({
  videoPreviewUrl,
  mode,
  editVideo,
  storeUpload,
  isShort,
  onFileReselected,
}: VideoPreviewContentProps): React.ReactNode {
  if (videoPreviewUrl) {
    return (
      <video
        src={videoPreviewUrl}
        className="absolute inset-0 w-full h-full object-cover"
        controls
        playsInline
        muted
      />
    );
  }
  if (mode === 'edit' && editVideo?.thumbnailUrl) {
    return (
      <img
        src={editVideo.thumbnailUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }
  if (storeUpload?.isStale) {
    return <StaleUploadPreview upload={storeUpload} onFileReselected={onFileReselected} />;
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {isShort ? (
        <Clapperboard className="w-12 h-12 text-text-tertiary" />
      ) : (
        <Film className="w-12 h-12 text-text-tertiary" />
      )}
    </div>
  );
}
