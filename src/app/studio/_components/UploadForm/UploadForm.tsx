'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check, Image as ImageIcon, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useFilePreview } from '@/hooks/use-file-preview';
import { studioClient as studio } from '@/api/client/studio.client';

import { ContentTypeSelector } from '../../_components/ContentTypeSelector';
import { VideoDropzone } from './VideoDropzone';
import { ThumbnailPicker } from './ThumbnailPicker';
import { UploadDetailsForm } from './UploadDetailsForm';
import { VisibilitySection } from './VisibilitySection';
import { UploadProgress } from './UploadProgress';
import type { UploadFormInput, UploadFormProps } from './types';

// Dynamic import for server action (video only)
async function getUploadVideoAction() {
  const { uploadVideoAction } = await import('../../upload/video/_actions');
  return uploadVideoAction;
}

export function UploadForm({ config, tipsBanner }: UploadFormProps) {
  const router = useRouter();
  useAuthStore();

  // File state using the hook
  const videoPreview = useFilePreview();
  const thumbnailPreview = useFilePreview();

  // Refs for input elements
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form setup
  const form = useForm<UploadFormInput>({
    resolver: zodResolver(config.schema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
      visibility: 'public',
      isNsfw: false,
    },
  });

  const { watch, setValue } = form;
  const title = watch('title');

  const handleVideoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!file.type.startsWith('video/')) {
          toast.error('Please select a valid video file');
          return;
        }
        if (file.size > config.maxFileSize) {
          toast.error(
            `${config.type === 'video' ? 'Video' : 'Short video'} must be less than ${config.maxFileSizeLabel}`
          );
          return;
        }
        videoPreview.setFile(file);

        // Auto-fill title from filename if empty
        if (!title) {
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
          setValue('title', nameWithoutExt);
        }
      }
    },
    [title, setValue, config.maxFileSize, config.maxFileSizeLabel, config.type, videoPreview]
  );

  const handleThumbnailSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          toast.error('Please select a valid image file');
          return;
        }
        thumbnailPreview.setFile(file);
      }
    },
    [thumbnailPreview]
  );

  const handleRemoveVideo = () => {
    videoPreview.clearFile();
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleRemoveThumbnail = () => {
    thumbnailPreview.clearFile();
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  const onSubmit = async (data: UploadFormInput) => {
    if (!videoPreview.file) {
      toast.error('Please select a video file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + config.progressIncrement;
        });
      }, config.progressInterval);

      const tagArray = data.tags
        ? data.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      let response: { success: boolean; errors?: Record<string, string[]> };

      if (config.uploadHandler === 'server-action') {
        const uploadVideoAction = await getUploadVideoAction();
        response = await uploadVideoAction({
          file: videoPreview.file,
          thumbnail: thumbnailPreview.file || null,
          title: data.title,
          ...(data.description && { description: data.description }),
          ...(tagArray.length > 0 && { tags: tagArray }),
          is_nsfw: data.isNsfw,
        });
      } else {
        response = await studio.uploadShort({
          file: videoPreview.file,
          thumbnail: thumbnailPreview.file || null,
          title: data.title,
          ...(data.description && { description: data.description }),
          ...(tagArray.length > 0 && { tags: tagArray }),
          is_nsfw: data.isNsfw,
        });
      }

      clearInterval(progressInterval);

      if (response.success) {
        setUploadProgress(100);
        toast.success(`${config.type === 'video' ? 'Video' : 'Short'} uploaded successfully!`);
        setTimeout(() => router.push('/studio'), 1500);
      } else {
        const errorMessages = response.errors
          ? Object.values(response.errors).flat().join(', ')
          : 'Upload failed';
        setUploadError(errorMessages);
        toast.error(errorMessages);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(`Failed to upload ${config.type}. Please try again.`);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const submitButtonClass = config.type === 'video' ? '' : 'bg-purple-600 hover:bg-purple-700';

  return (
    <div className="pt-6 lg:pt-8 max-w-4xl mx-auto">
      <div className="mb-8">
        {config.type === 'short' && (
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Creator studio</p>
        )}
        <h1
          className={`${config.type === 'short' ? 'text-3xl font-bold' : 'text-2xl font-semibold'} text-white`}
        >
          {config.title}
        </h1>
        <p className={config.type === 'short' ? 'text-white/50' : 'text-white/40'}>
          {config.subtitle}
        </p>

        <ContentTypeSelector />
      </div>

      {tipsBanner}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Video Upload */}
          <VideoDropzone
            config={config}
            videoFile={videoPreview.file}
            videoPreview={videoPreview.previewUrl}
            onVideoSelect={handleVideoSelect}
            onRemoveVideo={handleRemoveVideo}
            videoInputRef={videoInputRef}
          />

          {/* Thumbnail - only show as separate card for video uploads */}
          {config.type === 'video' && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#ab0013]" />
                  Thumbnail
                </h2>
                <ThumbnailPicker
                  config={config}
                  thumbnailPreview={thumbnailPreview.previewUrl}
                  onThumbnailSelect={handleThumbnailSelect}
                  onRemoveThumbnail={handleRemoveThumbnail}
                  thumbnailInputRef={thumbnailInputRef}
                />
              </CardContent>
            </Card>
          )}

          {/* Inline thumbnail for shorts - inside the video preview */}
          {config.type === 'short' && videoPreview.file && (
            <div className="absolute">{/* This is rendered inside VideoDropzone for shorts */}</div>
          )}

          {/* Details */}
          <UploadDetailsForm config={config} control={form.control} />

          {/* Visibility */}
          <VisibilitySection config={config} control={form.control} />

          {/* Upload Progress */}
          {isUploading && <UploadProgress config={config} progress={uploadProgress} />}

          {/* Error Display */}
          {uploadError && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-400">{uploadError}</p>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button variant="ghost" type="button" onClick={() => router.push('/studio')}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!videoPreview.file || !title?.trim() || isUploading}
              className={`min-w-[140px] ${submitButtonClass}`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...
                </>
              ) : uploadProgress === 100 ? (
                <>
                  <Check className="w-4 h-4 mr-2" /> Uploaded!
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" /> Upload{' '}
                  {config.type === 'video' ? 'Video' : 'Short'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
