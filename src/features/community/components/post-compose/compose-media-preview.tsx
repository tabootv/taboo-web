'use client';

import { useComposeStore } from '@/shared/stores/compose-store';
import { X } from 'lucide-react';
import { useEffect, useMemo } from 'react';

export function ComposeMediaPreview() {
  const images = useComposeStore((s) => s.draft.images);
  const audioFiles = useComposeStore((s) => s.draft.audioFiles);
  const removeImage = useComposeStore((s) => s.removeImage);
  const removeAudioFile = useComposeStore((s) => s.removeAudioFile);

  const imageUrls = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images]);

  useEffect(() => {
    return () => {
      imageUrls.forEach(URL.revokeObjectURL);
    };
  }, [imageUrls]);

  if (images.length === 0 && audioFiles.length === 0) return null;

  return (
    <div className="space-y-3">
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {imageUrls.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-white/5">
              <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {audioFiles.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {audioFiles.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-text-secondary"
            >
              <span className="truncate max-w-[160px]">{file.name}</span>
              <button
                type="button"
                onClick={() => removeAudioFile(i)}
                className="p-0.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
