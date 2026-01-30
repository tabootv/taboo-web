import { Upload, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { UploadConfig } from './types';

interface VideoDropzoneProps {
  config: UploadConfig;
  videoFile: File | null;
  videoPreview: string | null;
  onVideoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveVideo: () => void;
  videoInputRef: React.RefObject<HTMLInputElement | null>;
}

export function VideoDropzone({
  config,
  videoFile,
  videoPreview,
  onVideoSelect,
  onRemoveVideo,
  videoInputRef,
}: VideoDropzoneProps) {
  const FileIcon = config.fileIcon;

  return (
    <Card className="border border-white/10 bg-surface">
      <CardContent className="p-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <FileIcon className={`w-5 h-5 ${config.accentColorText}`} />
          {config.type === 'video' ? 'Video File' : 'Short Video'}
        </h2>

        {!videoFile ? (
          <label className="block cursor-pointer">
            <div
              className={`border-2 border-dashed border-white/20 rounded-xl p-12 text-center ${config.accentColorHover} transition-all`}
            >
              <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">
                Drag and drop your {config.type === 'video' ? 'video' : 'short video'} here
              </p>
              <p className="text-white/40 text-sm mb-4">or click to browse</p>
              <p className="text-xs text-white/40">{config.fileTypeLabel}</p>
            </div>
            <input
              ref={videoInputRef}
              type="file"
              accept={config.acceptedFileTypes}
              onChange={onVideoSelect}
              data-testid={config.type === 'video' ? 'studio-video-input' : 'studio-short-input'}
              className="hidden"
            />
          </label>
        ) : config.type === 'video' ? (
          <div className="relative">
            <div className={`${config.videoAspectClass} rounded-xl overflow-hidden bg-black`}>
              <video
                data-testid="studio-video-preview"
                src={videoPreview || undefined}
                className="w-full h-full object-contain"
                controls
              />
            </div>
            <button
              type="button"
              onClick={onRemoveVideo}
              data-testid="remove-video-btn"
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <p className="mt-3 text-sm text-white/40">
              {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
            </p>
          </div>
        ) : (
          <div className="flex gap-6">
            <div className="relative w-[200px] shrink-0">
              <div className={`${config.videoAspectClass} rounded-xl overflow-hidden bg-black`}>
                <video
                  data-testid="studio-short-preview"
                  src={videoPreview || undefined}
                  className="w-full h-full object-cover"
                  controls
                />
              </div>
              <button
                type="button"
                onClick={onRemoveVideo}
                data-testid="remove-short-btn"
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-white font-medium mb-2">{videoFile.name}</p>
              <p className="text-sm text-white/40 mb-4">
                {(videoFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
