'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload, X, Film, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/shared/stores/auth-store';
import { toast } from 'sonner';
import { apiClient } from '@/api/client/base-client';

export default function CreateShortPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_adult_content: false,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check duration - shorts should be < 60 seconds
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        if (video.duration > 60) {
          setError('Shorts must be 60 seconds or less');
          return;
        }
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
        setError('');
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('video', videoFile);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('is_adult_content', formData.is_adult_content ? '1' : '0');
      if (thumbnailFile) {
        data.append('thumbnail', thumbnailFile);
      }

      await apiClient.post('/contents/shorts', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      toast.success('Short uploaded successfully!');
      router.push('/contents/shorts');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to upload short');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (!user?.is_creator) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/contents/shorts"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shorts
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Upload Short</h1>
        <p className="text-text-secondary mt-1">Create a short video (60 seconds or less)</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Video File *</label>
            {videoPreview ? (
              <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-black max-w-[240px]">
                <video src={videoPreview} controls className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => videoInputRef.current?.click()}
                className="aspect-[9/16] max-w-[240px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-primary transition-colors"
              >
                <Upload className="w-10 h-10 text-text-secondary mb-3" />
                <p className="text-text-primary font-medium text-sm">Click to upload</p>
                <p className="text-xs text-text-secondary mt-1">Max 60 seconds</p>
              </div>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
            />
          </div>

          {/* Right side form */}
          <div className="space-y-6">
            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Thumbnail</label>
              {thumbnailPreview ? (
                <div className="relative w-32 aspect-[9/16] rounded-lg overflow-hidden">
                  <Image src={thumbnailPreview} alt="Thumbnail" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailFile(null);
                      setThumbnailPreview(null);
                    }}
                    className="absolute top-1 right-1 p-0.5 bg-black/50 hover:bg-black/70 rounded-full"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="w-32 aspect-[9/16] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-primary transition-colors"
                >
                  <Film className="w-6 h-6 text-text-secondary mb-1" />
                  <p className="text-xs text-text-secondary">Add cover</p>
                </div>
              )}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter short title"
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-primary focus:border-transparent text-text-primary placeholder:text-text-secondary"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add a description"
                rows={3}
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-primary focus:border-transparent text-text-primary placeholder:text-text-secondary resize-none"
              />
            </div>

            {/* Adult content */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_adult_content}
                onChange={(e) => setFormData({ ...formData, is_adult_content: e.target.checked })}
                className="w-5 h-5 rounded border-border text-red-primary focus:ring-red-primary"
              />
              <span className="text-text-primary text-sm">Contains adult content</span>
            </label>
          </div>
        </div>

        {/* Progress */}
        {isSubmitting && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Uploading...</span>
              <span className="text-text-primary font-medium">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-hover rounded-full overflow-hidden">
              <div
                className="h-full bg-red-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1 btn-premium">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Short'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
