'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, X, Film, AlertCircle, Loader2 } from 'lucide-react';
import { Button, LoadingScreen } from '@/components/ui';
import { useAuthStore } from '@/lib/stores';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';
import type { Video } from '@/types';

export default function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_free: false,
    is_adult_content: false,
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user && !user.is_creator) {
      router.push('/home');
      toast.error('You need to be a creator to access this page');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    async function fetchVideo() {
      try {
        setIsLoading(true);
        const { data } = await apiClient.get(`/contents/videos/${id}`);
        const videoData = data.video || data.data || data;
        setVideo(videoData);
        setFormData({
          title: videoData.title || '',
          description: videoData.description || '',
          is_free: videoData.is_free || false,
          is_adult_content: videoData.is_adult_content || false,
        });
        setThumbnailPreview(videoData.thumbnail || null);
      } catch (err) {
        console.error('Failed to fetch video:', err);
        toast.error('Failed to load video');
        router.push('/contents/videos');
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.is_creator) {
      fetchVideo();
    }
  }, [id, router, user?.is_creator]);

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

    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('is_free', formData.is_free ? '1' : '0');
      data.append('is_adult_content', formData.is_adult_content ? '1' : '0');
      if (thumbnailFile) {
        data.append('thumbnail', thumbnailFile);
      }

      await apiClient.post(`/contents/videos/${id}/update`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Video updated successfully!');
      router.push('/contents/videos');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update video');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user?.is_creator) {
    return null;
  }

  if (isLoading) {
    return <LoadingScreen message="Loading video..." />;
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
        <h1 className="text-2xl font-bold text-text-primary">Edit Video</h1>
        <p className="text-text-secondary mt-1">Update your video details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Current Video Preview */}
        {video?.thumbnail && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Current Video
            </label>
            <div className="relative w-80 aspect-video rounded-lg overflow-hidden bg-black">
              <Image src={video.thumbnail} alt={video.title} fill className="object-cover" />
            </div>
          </div>
        )}

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Thumbnail
          </label>
          {thumbnailPreview ? (
            <div className="relative w-64 aspect-video rounded-lg overflow-hidden">
              <Image src={thumbnailPreview} alt="Thumbnail" fill className="object-cover" />
              <button
                type="button"
                onClick={() => {
                  setThumbnailFile(null);
                  setThumbnailPreview(video?.thumbnail || null);
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
              <p className="text-sm text-text-secondary">Change thumbnail</p>
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

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1 btn-premium">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
