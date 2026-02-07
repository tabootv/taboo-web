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

export default function CreateVideoPage() {
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
    is_free: false,
    is_adult_content: false,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
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
      data.append('is_free', formData.is_free ? '1' : '0');
      data.append('is_adult_content', formData.is_adult_content ? '1' : '0');
      if (thumbnailFile) {
        data.append('thumbnail', thumbnailFile);
      }

      await apiClient.post('/contents/videos', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      toast.success('Video uploaded successfully!');
      router.push('/contents/videos');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to upload video');
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
          href="/contents/videos"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Videos
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Upload Video</h1>
        <p className="text-text-secondary mt-1">Share your content with your audience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Video Upload */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Video File *</label>
          {videoPreview ? (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              <video src={videoPreview} controls className="w-full h-full" />
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
              className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-red-primary transition-colors"
            >
              <Upload className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <p className="text-text-primary font-medium">Click to upload video</p>
              <p className="text-sm text-text-secondary mt-1">MP4, MOV, WebM up to 2GB</p>
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

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Thumbnail</label>
          {thumbnailPreview ? (
            <div className="relative w-64 aspect-video rounded-lg overflow-hidden">
              <Image src={thumbnailPreview} alt="Thumbnail" fill className="object-cover" />
              <button
                type="button"
                onClick={() => {
                  setThumbnailFile(null);
                  setThumbnailPreview(null);
                }}
                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => thumbnailInputRef.current?.click()}
              className="w-64 aspect-video border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-primary transition-colors"
            >
              <Film className="w-8 h-8 text-text-secondary mb-2" />
              <p className="text-sm text-text-secondary">Add thumbnail</p>
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
            placeholder="Enter video title"
            className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-primary focus:border-transparent text-text-primary placeholder:text-text-secondary"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your video"
            rows={4}
            className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-primary focus:border-transparent text-text-primary placeholder:text-text-secondary resize-none"
          />
        </div>

        {/* Options */}
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_free}
              onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
              className="w-5 h-5 rounded border-border text-red-primary focus:ring-red-primary"
            />
            <span className="text-text-primary">Make this video free for everyone</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_adult_content}
              onChange={(e) => setFormData({ ...formData, is_adult_content: e.target.checked })}
              className="w-5 h-5 rounded border-border text-red-primary focus:ring-red-primary"
            />
            <span className="text-text-primary">This video contains adult content</span>
          </label>
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
              'Upload Video'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
