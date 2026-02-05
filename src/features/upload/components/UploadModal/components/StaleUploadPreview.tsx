'use client';

import type { ActiveUpload } from '@/shared/stores/upload-store';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

interface StaleUploadPreviewProps {
  upload: ActiveUpload;
  onFileReselected: (file: File) => void;
}

/**
 * Shows message and file re-select for stale uploads
 * Stale uploads are those hydrated from localStorage without a live TUS client
 */
export function StaleUploadPreview({ upload, onFileReselected }: StaleUploadPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file matches original (basic check by name and size)
    if (file.name !== upload.fileName || file.size !== upload.fileSize) {
      toast.error('Please select the original file to restore preview');
      e.target.value = '';
      return;
    }

    onFileReselected(file);
    e.target.value = '';
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
      <AlertTriangle className="w-10 h-10 text-orange-500 mb-3" />
      <p className="text-sm text-text-secondary mb-2">Session expired</p>
      <p className="text-xs text-text-tertiary mb-4">
        Re-select the original file to restore preview
      </p>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-primary border border-red-primary/30 rounded-lg hover:bg-red-primary/10 transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Select file
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <p className="text-[10px] text-text-tertiary mt-2 max-w-[200px]">
        Looking for: {upload.fileName}
      </p>
    </div>
  );
}
