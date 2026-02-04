'use client';

import { useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Loader2,
  AlertTriangle,
  Pause,
  Play,
  Upload,
} from 'lucide-react';
import { cn } from '@/shared/utils/formatting';
import { useUploadStore, type ActiveUpload } from '@/shared/stores/upload-store';

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Get phase display info
 */
function getPhaseInfo(upload: ActiveUpload): {
  label: string;
  icon: React.ReactNode;
  color: string;
} {
  switch (upload.phase) {
    case 'preparing':
      return {
        label: 'Preparing...',
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        color: 'text-blue-400',
      };
    case 'uploading':
      if (upload.isPaused) {
        return {
          label: 'Paused',
          icon: <Pause className="w-4 h-4" />,
          color: 'text-yellow-500',
        };
      }
      return {
        label: `${upload.progress}%`,
        icon: <Upload className="w-4 h-4" />,
        color: 'text-red-primary',
      };
    case 'processing':
      return {
        label: 'Processing...',
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        color: 'text-purple-400',
      };
    case 'complete':
      return {
        label: 'Complete',
        icon: <Check className="w-4 h-4" />,
        color: 'text-green-500',
      };
    case 'error':
      return {
        label: 'Failed',
        icon: <AlertTriangle className="w-4 h-4" />,
        color: 'text-red-500',
      };
    default:
      return {
        label: 'Idle',
        icon: <Upload className="w-4 h-4" />,
        color: 'text-text-tertiary',
      };
  }
}

/**
 * Single upload item in the expanded list
 */
function UploadItem({ upload }: { upload: ActiveUpload }) {
  const pauseUpload = useUploadStore((state) => state.pauseUpload);
  const resumeUpload = useUploadStore((state) => state.resumeUpload);
  const removeUpload = useUploadStore((state) => state.removeUpload);

  const phaseInfo = getPhaseInfo(upload);
  const canPauseResume = upload.phase === 'uploading';
  const canRemove = upload.phase === 'complete' || upload.phase === 'error';

  return (
    <div className="p-3 border-b border-white/10 last:border-b-0">
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div className={cn('mt-0.5', phaseInfo.color)}>{phaseInfo.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary truncate" title={upload.fileName}>
            {upload.metadata.title || upload.fileName}
          </p>

          {/* Progress bar */}
          {(upload.phase === 'uploading' || upload.phase === 'preparing') && (
            <div className="mt-2">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    upload.isPaused ? 'bg-yellow-500' : 'bg-red-primary'
                  )}
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-text-tertiary">{phaseInfo.label}</span>
                <span className="text-xs text-text-tertiary">
                  {formatBytes(upload.bytesUploaded)} / {formatBytes(upload.bytesTotal)}
                </span>
              </div>
            </div>
          )}

          {/* Error message */}
          {upload.error && <p className="text-xs text-red-400 mt-1 line-clamp-2">{upload.error}</p>}

          {/* Completed status */}
          {upload.phase === 'complete' && (
            <p className="text-xs text-green-500 mt-1">Upload complete!</p>
          )}

          {/* Processing status */}
          {upload.phase === 'processing' && (
            <p className="text-xs text-purple-400 mt-1">Processing video...</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {canPauseResume && (
            <button
              onClick={() => (upload.isPaused ? resumeUpload(upload.id) : pauseUpload(upload.id))}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title={upload.isPaused ? 'Resume' : 'Pause'}
            >
              {upload.isPaused ? (
                <Play className="w-4 h-4 text-text-secondary" />
              ) : (
                <Pause className="w-4 h-4 text-text-secondary" />
              )}
            </button>
          )}

          {canRemove && (
            <button
              onClick={() => removeUpload(upload.id)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="Remove"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * GlobalUploadIndicator - Floating UI showing active uploads
 *
 * Features:
 * - Collapsed: pill showing upload count and overall progress
 * - Expanded: list with individual upload details, pause/resume
 * - Fixed position: bottom-right corner
 * - Auto-hides when no uploads
 */
export function GlobalUploadIndicator() {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasHydrated = useUploadStore((state) => state._hasHydrated);
  const uploads = useUploadStore((state) => state.uploads);
  const clearCompleted = useUploadStore((state) => state.clearCompleted);

  // Get uploads as array, excluding idle
  const activeUploads = Array.from(uploads.values()).filter((u) => u.phase !== 'idle');

  // Calculate overall progress
  const uploadingCount = activeUploads.filter(
    (u) => u.phase === 'uploading' || u.phase === 'preparing'
  ).length;

  const processingCount = activeUploads.filter((u) => u.phase === 'processing').length;
  const completedCount = activeUploads.filter((u) => u.phase === 'complete').length;
  const errorCount = activeUploads.filter((u) => u.phase === 'error').length;

  // Calculate average progress of uploading items
  const uploadingItems = activeUploads.filter((u) => u.phase === 'uploading');
  const averageProgress =
    uploadingItems.length > 0
      ? Math.round(uploadingItems.reduce((sum, u) => sum + u.progress, 0) / uploadingItems.length)
      : 0;

  // Toggle expanded state
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Don't render if not hydrated or no uploads
  if (!hasHydrated || activeUploads.length === 0) {
    return null;
  }

  // Determine status text
  let statusText = '';
  if (uploadingCount > 0) {
    statusText = `${uploadingCount} uploading`;
  } else if (processingCount > 0) {
    statusText = `${processingCount} processing`;
  } else if (errorCount > 0) {
    statusText = `${errorCount} failed`;
  } else if (completedCount > 0) {
    statusText = `${completedCount} complete`;
  }

  // Determine overall color
  let statusColor = 'bg-red-primary';
  if (errorCount > 0 && uploadingCount === 0 && processingCount === 0) {
    statusColor = 'bg-red-500';
  } else if (
    completedCount > 0 &&
    uploadingCount === 0 &&
    processingCount === 0 &&
    errorCount === 0
  ) {
    statusColor = 'bg-green-500';
  } else if (processingCount > 0 && uploadingCount === 0) {
    statusColor = 'bg-purple-500';
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Expanded view */}
      {isExpanded && (
        <div className="mb-2 w-80 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-semibold text-text-primary">Uploads</h3>
            <div className="flex items-center gap-2">
              {completedCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  Clear completed
                </button>
              )}
            </div>
          </div>

          {/* Upload list */}
          <div className="max-h-64 overflow-y-auto">
            {activeUploads.map((upload) => (
              <UploadItem key={upload.id} upload={upload} />
            ))}
          </div>
        </div>
      )}

      {/* Collapsed pill */}
      <button
        onClick={toggleExpanded}
        className={cn(
          'flex items-center gap-3 px-4 py-2.5 rounded-full shadow-lg transition-all',
          'hover:scale-105 active:scale-100',
          'bg-surface border border-white/10'
        )}
      >
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className={cn('w-2.5 h-2.5 rounded-full', statusColor)}>
            {(uploadingCount > 0 || processingCount > 0) && (
              <span className="block w-full h-full rounded-full animate-ping opacity-75" />
            )}
          </div>
          <span className="text-sm text-text-primary font-medium">{statusText}</span>
        </div>

        {/* Progress bar (when uploading) */}
        {uploadingCount > 0 && (
          <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-primary rounded-full transition-all duration-300"
              style={{ width: `${averageProgress}%` }}
            />
          </div>
        )}

        {/* Expand/collapse icon */}
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-text-tertiary" />
        ) : (
          <ChevronUp className="w-4 h-4 text-text-tertiary" />
        )}
      </button>
    </div>
  );
}
