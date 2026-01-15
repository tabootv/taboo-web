'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, X, Film, AlertCircle, Loader2 } from 'lucide-react';
import { Button, LoadingScreen } from '@/components/ui';
import { useAuthStore } from '@/lib/stores';
import { toast } from 'sonner';
import { apiClient } from '@/api/client';
import type { Video } from '@/types';

export default function EditShortPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [short, setShort] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_adult_content: false,
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShort() {
      try {
        setIsLoading(true);
        const response = await apiClient.get<{ video?: Video; data?: Video } | Video>(`/contents/shorts/${id}`);
        const shortData = (response && typeof response === 'object' && 'video' in response ? response.video : response && typeof response === 'object' && 'data' in response ? response.data : response) as Video;
        setShort(shortData);
        setFormData({
          title: shortData.title || '',
          description: shortData.description || '',
          is_adult_content: shortData.is_adult_content || false,
        });
        setThumbnailPreview(shortData.thumbnail || null);
      } catch (err) {
        console.error('Failed to fetch short:', err);
        toast.error('Failed to load short');
        router.push('/contents/shorts');
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.is_creator) {
      fetchShort();
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
      data.append('is_adult_content', formData.is_adult_content ? '1' : '0');
      if (thumbnailFile) {
        data.append('thumbnail', thumbnailFile);
      }

      await apiClient.post(`/contents/shorts/${id}/update`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Short updated successfully!');
      router.push('/contents/shorts');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update short');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user?.is_creator) {
    return null;
  }

  if (isLoading) {
    return <LoadingScreen message="Loading short..." />;
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
        <h1 className="text-2xl font-bold text-text-primary">Edit Short</h1>
        <p className="text-text-secondary mt-1">Update your short details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Short Preview */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Current Short
            </label>
            {short?.thumbnail && (
              <div className="relative aspect-[9/16] max-w-[200px] rounded-lg overflow-hidden bg-black">
                <Image src={short.thumbnail} alt={short.title} fill className="object-cover" />
              </div>
            )}
          </div>

          {/* Right side form */}
          <div className="space-y-6">
            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Thumbnail
              </label>
              {thumbnailPreview ? (
                <div className="relative w-32 aspect-[9/16] rounded-lg overflow-hidden">
                  <Image src={thumbnailPreview} alt="Thumbnail" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailFile(null);
                      setThumbnailPreview(short?.thumbnail || null);
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
                  <p className="text-xs text-text-secondary">Change cover</p>
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
