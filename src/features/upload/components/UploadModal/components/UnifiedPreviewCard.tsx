'use client';

import { Button } from '@/components/ui/button';
import { UploadProgressBar } from '@/shared/components/upload/UploadProgressBar';
import type { ActiveUpload, UploadPhase } from '@/shared/stores/upload-store';
import { cn } from '@/shared/utils/formatting';
import { getShortUrl } from '@/shared/utils/video-link';
import { AlertTriangle, Check, Copy, Loader2, RotateCcw } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { EditVideoData } from '../types';
import { formatBytes } from '../utils';
import { VideoPreviewContent } from './VideoPreviewContent';

interface UnifiedPreviewCardProps {
  // Preview
  videoPreviewUrl: string | null;
  mode: 'upload' | 'edit';
  editVideo: EditVideoData | undefined;
  storeUpload: ActiveUpload | undefined;
  isShort: boolean;
  onFileReselected: (file: File) => void;
  // Upload state
  uploadPhase: UploadPhase;
  uploadProgress: number;
  bytesUploaded: number;
  bytesTotal: number;
  error: string | null;
  videoUuid: string | null;
  onRetry: () => void;
}

function formatEta(remainingMs: number): string {
  const minutes = Math.ceil(remainingMs / 60_000);
  if (minutes < 1) return '< 1 min left';
  if (minutes < 60) return `~${minutes} min left`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `~${hours} hr ${mins} min left` : `~${hours} hr left`;
}

function getStatusText(phase: UploadPhase, progress: number, isStale: boolean): React.ReactNode {
  if (isStale) {
    return (
      <span className="flex items-center gap-1.5 text-orange-400">
        <AlertTriangle className="w-3.5 h-3.5" />
        Session expired
      </span>
    );
  }
  if (phase === 'preparing') return 'Preparing...';
  if (phase === 'uploading') return `Uploading ${progress}%`;
  if (phase === 'processing') {
    return (
      <span className="flex items-center gap-1.5">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Processing...
      </span>
    );
  }
  if (phase === 'complete') {
    return (
      <span className="flex items-center gap-1.5 text-green-400">
        <Check className="w-3.5 h-3.5" />
        Upload complete
      </span>
    );
  }
  if (phase === 'error') return 'Upload failed';
  return null;
}

export function UnifiedPreviewCard({
  videoPreviewUrl,
  mode,
  editVideo,
  storeUpload,
  isShort,
  onFileReselected,
  uploadPhase,
  uploadProgress,
  bytesUploaded,
  bytesTotal,
  error,
  videoUuid,
  onRetry,
}: UnifiedPreviewCardProps) {
  const [copied, setCopied] = useState(false);
  const isStale = storeUpload?.isStale ?? false;
  const showProgress = mode === 'upload' && uploadPhase !== 'idle';
  const showStatus = showProgress;

  // Video link computation
  const uuid = videoUuid || (mode === 'edit' ? editVideo?.uuid : undefined) || '';
  const hasLink = Boolean(uuid);
  const origin =
    typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || '';
  const shortPath = hasLink ? getShortUrl(uuid) : '';
  const fullUrl = hasLink ? `${origin}${shortPath}` : '';

  // ETA calculation
  let etaText: string | null = null;
  if (uploadPhase === 'uploading' && bytesUploaded > 0 && storeUpload?.startedAt) {
    const elapsed = Date.now() - storeUpload.startedAt;
    if (elapsed > 0) {
      const speed = bytesUploaded / elapsed; // bytes/ms
      const remaining = bytesTotal - bytesUploaded;
      if (speed > 0) {
        etaText = formatEta(remaining / speed);
      }
    }
  }

  const handleCopy = useCallback(async () => {
    if (!fullUrl) return;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  }, [fullUrl]);

  return (
    <div className="overflow-hidden rounded-lg bg-white/5 h-min">
      {/* Video Preview Area */}
      <div
        className={cn(
          'relative overflow-hidden bg-black',
          isShort ? 'aspect-[9/16] max-h-[300px] mx-auto' : 'aspect-video'
        )}
      >
        <VideoPreviewContent
          videoPreviewUrl={videoPreviewUrl}
          mode={mode}
          editVideo={editVideo}
          storeUpload={storeUpload}
          isShort={isShort}
          onFileReselected={onFileReselected}
        />
        {/* Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
          {isShort ? 'Short' : 'Video'}
        </div>
        {/* Processing overlay */}
        {uploadPhase === 'processing' && !videoPreviewUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-text-tertiary animate-spin mx-auto mb-2" />
              <p className="text-sm text-text-secondary">Processing will start soon</p>
            </div>
          </div>
        )}
      </div>

      {/* Thin progress bar - flush below preview */}
      {showProgress && (
        <UploadProgressBar
          phase={storeUpload?.phase ?? uploadPhase}
          progress={storeUpload?.progress ?? uploadProgress}
          isStale={isStale}
          size="sm"
          className="rounded-none"
        />
      )}

      {/* Status row */}
      {showStatus && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
          <span className="text-sm text-text-primary">
            {getStatusText(uploadPhase, uploadProgress, isStale)}
          </span>
          <span className="text-xs text-text-tertiary">
            {uploadPhase === 'uploading' && !isStale && etaText
              ? etaText
              : uploadPhase === 'uploading' && !isStale
                ? `${formatBytes(bytesUploaded)} / ${formatBytes(bytesTotal)}`
                : null}
          </span>
        </div>
      )}

      {/* Info section */}
      <div className="p-4 space-y-3">
        {/* Video Link */}
        {hasLink && (
          <div>
            <p className="text-xs text-text-tertiary mb-1">{isShort ? 'Short' : 'Video'} Link</p>
            <div className="flex items-start gap-2">
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 break-all transition-colors flex-1 min-w-0"
              >
                {fullUrl}
              </a>
              <button
                onClick={handleCopy}
                className="shrink-0 p-1.5 rounded hover:bg-white/10 transition-colors text-text-secondary hover:text-text-primary"
                title="Copy link"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* File Name - upload mode only */}
        {mode === 'upload' && storeUpload?.fileName && (
          <div>
            <p className="text-xs text-text-tertiary mb-1">File Name</p>
            <p className="text-sm text-text-primary truncate">{storeUpload.fileName}</p>
          </div>
        )}

        {/* Error + Retry */}
        {error && !isStale && mode === 'upload' && (
          <div>
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
    </div>
  );
}
