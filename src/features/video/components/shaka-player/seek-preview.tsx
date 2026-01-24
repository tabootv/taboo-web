'use client';

import { formatDuration } from '@/lib/utils';
import type { SeekPreview as SeekPreviewType } from './types';

interface SeekPreviewProps {
  seekPreview: SeekPreviewType | null;
  previewImage: string | null;
  thumbnail?: string | undefined;
}

export function SeekPreview({ seekPreview, previewImage, thumbnail }: SeekPreviewProps) {
  if (!seekPreview) return null;

  return (
    <div
      className="absolute z-50 pointer-events-none transform -translate-x-1/2"
      style={{
        left: `${seekPreview.position}%`,
        bottom: '14px',
      }}
    >
      <div className="flex flex-col items-center gap-1">
        {previewImage || thumbnail ? (
          <div className="rounded-md overflow-hidden border border-white/15 bg-black/70 shadow-lg">
            <img
              src={previewImage || thumbnail}
              alt="Preview"
              className="w-32 h-[72px] object-cover"
            />
          </div>
        ) : null}
        <div className="bg-black/80 text-white text-xs px-2.5 py-1 rounded-md shadow-sm tabular-nums">
          {formatDuration(seekPreview.time)}
        </div>
      </div>
    </div>
  );
}
