'use client';

import { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/shared/utils/formatting';
import type { LucideIcon } from 'lucide-react';

interface FileDropzoneProps {
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept: string;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  label: string;
  hint: string;
  icon?: LucideIcon;
  testId?: string;
  className?: string;
}

/**
 * Reusable drag-and-drop file upload zone
 * Supports both drag-drop and click-to-browse
 */
export function FileDropzone({
  onDrop,
  onFileSelect,
  accept,
  isDragging,
  setIsDragging,
  inputRef,
  label,
  hint,
  icon: Icon = Upload,
  testId,
  className,
}: FileDropzoneProps) {
  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
    },
    [setIsDragging]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
    },
    [setIsDragging]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, [inputRef]);

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={onDrop}
      className={cn(
        'relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
        isDragging
          ? 'border-red-primary bg-red-primary/5'
          : 'border-border hover:border-red-primary/40 hover:bg-red-primary/5',
        className
      )}
    >
      <Icon className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
      <p className="text-text-primary font-medium mb-2">{label}</p>
      <p className="text-text-tertiary text-sm mb-4">or click to browse</p>
      <p className="text-xs text-text-tertiary">{hint}</p>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onFileSelect}
        data-testid={testId}
        className="sr-only"
      />
    </div>
  );
}
