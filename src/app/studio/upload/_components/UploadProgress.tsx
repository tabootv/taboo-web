'use client';

import { Loader2, Check, AlertCircle, Upload } from 'lucide-react';
import { cn } from '@/shared/utils/formatting';
import type { UploadPhase } from '../_config/types';

interface UploadProgressProps {
  phase: UploadPhase;
  progress: number;
  bytesUploaded?: number;
  bytesTotal?: number;
  error?: string | null;
  contentType: 'video' | 'short';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Upload progress indicator showing phase and percentage
 * Displays different states: preparing, uploading, processing, complete, error
 */
export function UploadProgress({
  phase,
  progress,
  bytesUploaded = 0,
  bytesTotal = 0,
  error,
  contentType,
}: UploadProgressProps) {
  const contentLabel = contentType === 'video' ? 'video' : 'short';

  const getPhaseContent = () => {
    switch (phase) {
      case 'preparing':
        return {
          icon: <Loader2 className="w-5 h-5 text-red-primary animate-spin" />,
          title: 'Preparing upload...',
          subtitle: 'Setting up your upload',
        };
      case 'uploading':
        return {
          icon: <Upload className="w-5 h-5 text-red-primary" />,
          title: `Uploading ${contentLabel}...`,
          subtitle:
            bytesTotal > 0
              ? `${formatBytes(bytesUploaded)} of ${formatBytes(bytesTotal)}`
              : 'Starting upload...',
        };
      case 'processing':
        return {
          icon: <Loader2 className="w-5 h-5 text-red-primary animate-spin" />,
          title: 'Processing...',
          subtitle: 'Your video is being processed',
        };
      case 'complete':
        return {
          icon: <Check className="w-5 h-5 text-green-500" />,
          title: 'Upload complete!',
          subtitle: 'Redirecting to studio...',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          title: 'Upload failed',
          subtitle: error || 'Please try again',
        };
      default:
        return null;
    }
  };

  const content = getPhaseContent();

  if (!content) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-xl p-4 border',
        phase === 'error' ? 'bg-red-500/10 border-red-500/50' : 'bg-surface border-border'
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        {content.icon}
        <div className="flex-1">
          <p className="text-text-primary font-medium">{content.title}</p>
          <p className="text-sm text-text-secondary">{content.subtitle}</p>
        </div>
        {phase !== 'error' && phase !== 'idle' && (
          <span className="text-sm font-medium text-text-primary">{progress}%</span>
        )}
      </div>

      {phase !== 'error' && (
        <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out',
              phase === 'complete' ? 'bg-green-500' : 'bg-red-primary'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
