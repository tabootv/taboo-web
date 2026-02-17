'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import {
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Loader2,
  AlertTriangle,
  Upload,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/utils/formatting';
import { useUploadStore, type ActiveUpload } from '@/shared/stores/upload-store';
import { UploadProgressBar } from './UploadProgressBar';

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
  // Check for stale uploads first (hydrated without live TUS client)
  if (upload.isStale) {
    return {
      label: 'Session expired',
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-orange-500',
    };
  }

  switch (upload.phase) {
    case 'preparing':
      return {
        label: 'Preparing...',
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        color: 'text-blue-400',
      };
    case 'uploading':
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
  const router = useRouter();
  const removeUpload = useUploadStore((state) => state.removeUpload);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const phaseInfo = getPhaseInfo(upload);
  const canRemove = upload.phase === 'complete' || upload.phase === 'error' || upload.isStale;
  const canSeeInStudio = !!upload.videoUuid;

  /**
   * Handle stale upload resume - user re-selects original file
   */
  const handleResumeStale = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file matches original (basic check by name and size)
    if (file.name !== upload.fileName || file.size !== upload.fileSize) {
      toast.error('Please select the original file to resume');
      e.target.value = '';
      return;
    }

    // Navigate to content page with resume flag
    router.push(`/studio/content?uploadId=${upload.id}&resume=true`);
    e.target.value = '';
  };

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

          {/* Progress bar - only show for active uploads, not stale */}
          {(upload.phase === 'uploading' || upload.phase === 'preparing') && !upload.isStale && (
            <div className="mt-2">
              <UploadProgressBar
                phase={upload.phase}
                progress={upload.progress}
                isStale={upload.isStale}
                size="sm"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-text-tertiary">{phaseInfo.label}</span>
                <span className="text-xs text-text-tertiary">
                  {formatBytes(upload.bytesUploaded)} / {formatBytes(upload.bytesTotal)}
                </span>
              </div>
            </div>
          )}

          {/* Stale session message with resume option */}
          {upload.isStale && (
            <div className="mt-2">
              <p className="text-xs text-orange-500 mb-2">
                Session expired. Re-select the original file to resume.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-red-primary hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                Resume upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleResumeStale}
              />
            </div>
          )}

          {/* Error message - only show if phase is actually 'error' (not stale errors) */}
          {upload.phase === 'error' && upload.error && !upload.isStale && (
            <p className="text-xs text-red-400 mt-1 line-clamp-2">{upload.error}</p>
          )}

          {/* Completed status */}
          {upload.phase === 'complete' && (
            <p className="text-xs text-green-500 mt-1">Upload complete!</p>
          )}

          {/* Processing status */}
          {upload.phase === 'processing' && !upload.isStale && (
            <p className="text-xs text-purple-400 mt-1">Processing video...</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* See in Studio button - for uploads with videoUuid */}
          {canSeeInStudio && (
            <button
              onClick={() => router.push('/studio/content')}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="See in Studio"
            >
              <ExternalLink className="w-4 h-4 text-text-secondary" />
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
  // Use useShallow to prevent re-renders when uploads Map reference changes but contents are same
  const uploads = useUploadStore(useShallow((state) => state.uploads));
  const clearCompleted = useUploadStore((state) => state.clearCompleted);

  // Get uploads as array, excluding idle - memoized to prevent unnecessary recalcs
  const activeUploads = useMemo(
    () => Array.from(uploads.values()).filter((u) => u.phase !== 'idle'),
    [uploads]
  );

  // Calculate overall progress
  const uploadingCount = activeUploads.filter(
    (u) => u.phase === 'uploading' || u.phase === 'preparing'
  ).length;

  const processingCount = activeUploads.filter(
    (u) => u.phase === 'processing' && !u.isStale
  ).length;
  const completedCount = activeUploads.filter((u) => u.phase === 'complete').length;
  const errorCount = activeUploads.filter((u) => u.phase === 'error' && !u.isStale).length;
  const staleCount = activeUploads.filter((u) => u.isStale).length;

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
  } else if (staleCount > 0) {
    statusText = `${staleCount} expired`;
  } else if (errorCount > 0) {
    statusText = `${errorCount} failed`;
  } else if (completedCount > 0) {
    statusText = `${completedCount} complete`;
  }

  // Determine overall color
  let statusColor = 'bg-red-primary';
  if (staleCount > 0 && uploadingCount === 0 && processingCount === 0 && errorCount === 0) {
    statusColor = 'bg-orange-500';
  } else if (errorCount > 0 && uploadingCount === 0 && processingCount === 0) {
    statusColor = 'bg-red-500';
  } else if (
    completedCount > 0 &&
    uploadingCount === 0 &&
    processingCount === 0 &&
    errorCount === 0 &&
    staleCount === 0
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
