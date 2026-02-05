'use client';

import { Button } from '@/components/ui/button';
import { UploadProgressBar } from '@/shared/components/upload/UploadProgressBar';
import type { ActiveUpload, UploadPhase } from '@/shared/stores/upload-store';
import { AlertTriangle, Check, Pause, Play, RotateCcw } from 'lucide-react';
import { formatBytes } from '../utils';

interface UploadStatusProps {
  uploadPhase: string;
  uploadProgress: number;
  isPaused: boolean;
  isStale: boolean;
}

/**
 * Get upload status display content
 */
function getUploadStatusContent({
  uploadPhase,
  uploadProgress,
  isPaused,
  isStale,
}: UploadStatusProps): React.ReactNode {
  if (isStale) {
    return (
      <>
        <AlertTriangle className="w-4 h-4 text-orange-500" />
        Session expired
      </>
    );
  }
  if (uploadPhase === 'preparing') return 'Preparing...';
  if (uploadPhase === 'uploading' && !isPaused) return `Uploading... ${uploadProgress}%`;
  if (uploadPhase === 'uploading' && isPaused) {
    return (
      <>
        <Pause className="w-4 h-4 text-yellow-500" />
        Upload paused - Click resume to continue
      </>
    );
  }
  if (uploadPhase === 'processing') return 'Processing...';
  if (uploadPhase === 'error') return 'Upload failed';
  if (uploadPhase === 'complete') {
    return (
      <>
        <Check className="w-4 h-4 text-green-500" />
        Upload complete!
      </>
    );
  }
  return null;
}

interface UploadProgressSectionProps {
  uploadPhase: UploadPhase;
  uploadProgress: number;
  bytesUploaded: number;
  bytesTotal: number;
  isPaused: boolean;
  error: string | null;
  storeUpload: ActiveUpload | undefined;
  onPause: () => void;
  onResume: () => void;
  onRetry: () => void;
}

/**
 * Upload progress section with controls
 */
export function UploadProgressSection({
  uploadPhase,
  uploadProgress,
  bytesUploaded,
  bytesTotal,
  isPaused,
  error,
  storeUpload,
  onPause,
  onResume,
  onRetry,
}: UploadProgressSectionProps): React.ReactNode {
  const isStale = storeUpload?.isStale ?? false;

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-text-primary flex items-center gap-2">
          {getUploadStatusContent({ uploadPhase, uploadProgress, isPaused, isStale })}
        </span>
        {uploadPhase === 'uploading' && !isPaused && !isStale && (
          <span className="text-xs text-text-tertiary">
            {formatBytes(bytesUploaded)} / {formatBytes(bytesTotal)}
          </span>
        )}
      </div>
      <UploadProgressBar
        phase={storeUpload?.phase ?? uploadPhase}
        progress={storeUpload?.progress ?? uploadProgress}
        isPaused={storeUpload?.isPaused ?? isPaused}
        isStale={isStale}
      />

      {/* Pause/Resume buttons */}
      {uploadPhase === 'uploading' && !isStale && (
        <div className="flex items-center gap-2 mt-3">
          {isPaused ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onResume}
              className="flex items-center gap-1.5"
            >
              <Play className="w-4 h-4" />
              Resume
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={onPause}
              className="flex items-center gap-1.5"
            >
              <Pause className="w-4 h-4" />
              Pause
            </Button>
          )}
        </div>
      )}

      {error && !isStale && (
        <div className="mt-2">
          <p className="text-xs text-red-400">{error}</p>
          {uploadPhase === 'error' && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="mt-2 flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Upload
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
