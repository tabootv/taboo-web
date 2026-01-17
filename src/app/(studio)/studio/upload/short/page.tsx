'use client';

import { studioClient as studio } from '@/api/client';
import { ContentTypeSelector } from '@/components/studio';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuthStore } from '@/lib/stores';
import { uploadShortSchema, type UploadShortInput } from '@/lib/validations/upload';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Check,
  Clock,
  Film,
  Globe,
  Image as ImageIcon,
  Loader2,
  Lock,
  Smartphone,
  Tag,
  Upload,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function UploadShortPage() {
  const router = useRouter();
  useAuthStore();

  // File upload state (kept separate from form)
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<string | null>(null);
  const thumbnailPreviewRef = useRef<string | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // React Hook Form
  const form = useForm<UploadShortInput>({
    resolver: zodResolver(uploadShortSchema),
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
        if (file.size > 500 * 1024 * 1024) {
          toast.error('Short video must be less than 500MB');
          return;
        }
        setVideoFile(file);
        if (videoPreviewRef.current) {
          try {
            URL.revokeObjectURL(videoPreviewRef.current);
          } catch {}
          videoPreviewRef.current = null;
        }
        const url = URL.createObjectURL(file);
        videoPreviewRef.current = url;
        setVideoPreview(url);
        // Auto-fill title from filename if empty
        if (!title) {
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
          setValue('title', nameWithoutExt);
        }
      }
    },
    [title, setValue]
  );

  const handleThumbnailSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      setThumbnail(file);
      if (thumbnailPreviewRef.current) {
        try {
          URL.revokeObjectURL(thumbnailPreviewRef.current);
        } catch {}
        thumbnailPreviewRef.current = null;
      }
      const url = URL.createObjectURL(file);
      thumbnailPreviewRef.current = url;
      setThumbnailPreview(url);
    }
  }, []);

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    if (videoPreviewRef.current) {
      try {
        URL.revokeObjectURL(videoPreviewRef.current);
      } catch {}
      videoPreviewRef.current = null;
    }
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleRemoveThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    if (thumbnailPreviewRef.current) {
      try {
        URL.revokeObjectURL(thumbnailPreviewRef.current);
      } catch {}
      thumbnailPreviewRef.current = null;
    }
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoPreviewRef.current) {
        try {
          URL.revokeObjectURL(videoPreviewRef.current);
        } catch {}
      }
      if (thumbnailPreviewRef.current) {
        try {
          URL.revokeObjectURL(thumbnailPreviewRef.current);
        } catch {}
      }
    };
  }, []);

  const onSubmit = async (data: UploadShortInput) => {
    if (!videoFile) {
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
          return prev + 15;
        });
      }, 400);

      const tagArray = data.tags
        ? data.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const response = await studio.uploadShort({
        file: videoFile,
        thumbnail: thumbnail || null,
        title: data.title,
        ...(data.description && { description: data.description }),
        ...(tagArray.length > 0 && { tags: tagArray }),
        is_nsfw: data.isNsfw,
      });

      clearInterval(progressInterval);

      if (response.success) {
        setUploadProgress(100);
        toast.success('Short uploaded successfully!');
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
      setUploadError('Failed to upload short. Please try again.');
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="pt-6 lg:pt-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">Creator studio</p>
        <h1 className="text-3xl font-bold text-white">Upload a Short</h1>
        <p className="text-white/50">Quick, vertical drops with the same Taboo polish.</p>

        <ContentTypeSelector />
      </div>

      {/* Tips Banner */}
      <Card className="mb-6 border border-white/10 bg-gradient-to-r from-black via-[#120508] to-[#1a0b0c] shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="p-3 rounded-xl bg-red-primary/15 border border-red-primary/30 h-fit">
              <Smartphone className="w-5 h-5 text-red-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">Shorts that pop</h3>
              <ul className="text-sm text-white/60 space-y-1">
                <li className="flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Aim for 15-45 seconds
                </li>
                <li className="flex items-center gap-2">
                  <Smartphone className="w-3 h-3" /> 9:16 vertical, crisp thumbnail
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Video Upload */}
          <Card className="border border-white/10 bg-surface">
            <CardContent className="p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Film className="w-5 h-5 text-red-primary" />
                Short Video
              </h2>

              {!videoFile ? (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-white/15 rounded-xl p-12 text-center hover:border-red-primary/40 hover:bg-red-primary/5 transition-all">
                    <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white font-medium mb-2">
                      Drag and drop your short video here
                    </p>
                    <p className="text-white/40 text-sm mb-4">or click to browse</p>
                    <p className="text-xs text-white/40">
                      Vertical video (9:16) recommended • Up to 60 seconds • Max 500MB
                    </p>
                  </div>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    data-testid="studio-short-input"
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex gap-6">
                  <div className="relative w-[200px] shrink-0">
                    <div className="aspect-[9/16] rounded-xl overflow-hidden bg-black">
                      <video
                        data-testid="studio-short-preview"
                        src={videoPreview || undefined}
                        className="w-full h-full object-cover"
                        controls
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
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
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-white mb-2">
                        Custom Thumbnail
                      </label>
                      {thumbnailPreview ? (
                        <div className="relative w-24 aspect-[9/16] rounded-lg overflow-hidden">
                          <Image
                            src={thumbnailPreview}
                            alt="Thumbnail"
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveThumbnail}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/60"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-24 aspect-[9/16] border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-primary/40 transition-all">
                          <ImageIcon className="w-5 h-5 text-red-primary/80 mb-1" />
                          <span className="text-xs text-white/40">Add</span>
                          <input
                            ref={thumbnailInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailSelect}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-white mb-4">Details</h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Title <span className="text-[#ab0013]">*</span>
                      </FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="text"
                          placeholder="Enter short title"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                          maxLength={100}
                        />
                      </FormControl>
                      <div className="flex justify-between">
                        <FormMessage />
                        <p className="text-xs text-white/40">{field.value?.length || 0}/100</p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          placeholder="Add a description"
                          rows={3}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                          maxLength={500}
                        />
                      </FormControl>
                      <div className="flex justify-between">
                        <FormMessage />
                        <p className="text-xs text-white/40">{field.value?.length || 0}/500</p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Tags
                      </FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="text"
                          placeholder="Add tags (comma separated)"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Visibility */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-white mb-4">Visibility</h2>
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-4">
                        <label className="flex-1 flex items-center gap-3 p-4 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                          <input
                            type="radio"
                            checked={field.value === 'public'}
                            onChange={() => field.onChange('public')}
                            className="w-4 h-4 accent-purple-500"
                          />
                          <Globe className="w-5 h-5 text-white/40" />
                          <span className="text-white font-medium">Public</span>
                        </label>
                        <label className="flex-1 flex items-center gap-3 p-4 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                          <input
                            type="radio"
                            checked={field.value === 'private'}
                            onChange={() => field.onChange('private')}
                            className="w-4 h-4 accent-purple-500"
                          />
                          <Lock className="w-5 h-5 text-white/40" />
                          <span className="text-white font-medium">Private</span>
                        </label>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="mt-6 pt-6 border-t border-white/10">
                <FormField
                  control={form.control}
                  name="isNsfw"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <label className="flex items-center justify-between cursor-pointer">
                          <div>
                            <p className="text-white font-medium">Age-restricted (18+)</p>
                            <p className="text-sm text-white/40">
                              Not suitable for younger audiences
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => field.onChange(!field.value)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${field.value ? 'bg-purple-500' : 'bg-white/20'}`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${field.value ? 'left-7' : 'left-1'}`}
                            />
                          </button>
                        </label>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {isUploading && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  <span className="text-white font-medium">Uploading short...</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-white/40">{uploadProgress}% complete</p>
              </CardContent>
            </Card>
          )}

          {uploadError && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-400">{uploadError}</p>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button variant="ghost" type="button" onClick={() => router.push('/studio')}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!videoFile || !title?.trim() || isUploading}
              className="min-w-[140px] bg-purple-600 hover:bg-purple-700"
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
                  <Upload className="w-4 h-4 mr-2" /> Upload Short
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
