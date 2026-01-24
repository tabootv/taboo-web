'use client';;
import { useState, useRef, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ImageIcon,
  Globe,
  Lock,
  Clock,
  Tag,
  X,
  Trash2,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/spinner';
import { toast } from 'sonner';
import type { Video } from '@/types';

type Visibility = 'public' | 'private' | 'unlisted';

export default function EditContentPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, _setContent] = useState<Video | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [_thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // TODO: Fetch content details from API when endpoint is available
    // For now, show placeholder
    setIsLoading(false);
    toast.info('Content editing coming soon. Backend integration in progress.');
  }, [uuid]);

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Thumbnail must be less than 5MB');
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement API call when endpoint is available
      // const formData = new FormData();
      // formData.append('title', title);
      // formData.append('description', description);
      // formData.append('visibility', visibility);
      // formData.append('tags', JSON.stringify(tags));
      // if (thumbnailFile) {
      //   formData.append('thumbnail', thumbnailFile);
      // }
      // await apiClient.patch(`/content/${uuid}`, formData);

      toast.info('Content editing coming soon. Backend integration in progress.');
    } catch (error) {
      console.error('Failed to update content:', error);
      toast.error('Failed to update content. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      // TODO: Implement API call when endpoint is available
      // await apiClient.delete(`/content/${uuid}`);
      toast.info('Content deletion coming soon. Backend integration in progress.');
      // router.push('/content');
    } catch (error) {
      console.error('Failed to delete content:', error);
      toast.error('Failed to delete content. Please try again.');
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading content..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/content"
            className="p-2 hover:bg-hover rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Edit Content</h1>
            <p className="text-sm text-text-secondary mt-1">Update your video details</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          Delete
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Current Video Preview */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Video Preview</h2>
          <div className="aspect-video bg-hover rounded-lg flex items-center justify-center">
            {content?.thumbnail ? (
              <Image
                src={content.thumbnail_webp || content.thumbnail}
                alt={content.title || 'Video thumbnail'}
                fill
                className="object-cover rounded-lg"
              />
            ) : (
              <p className="text-text-secondary">No preview available</p>
            )}
          </div>
        </div>

        {/* Thumbnail */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Thumbnail</h2>
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailSelect}
            className="hidden"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {thumbnailPreview || content?.thumbnail ? (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={thumbnailPreview || content?.thumbnail_webp || content?.thumbnail || ''}
                  alt="Thumbnail preview"
                  fill
                  className="object-cover"
                />
                {thumbnailPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailFile(null);
                      setThumbnailPreview(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                className="aspect-video flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg hover:border-red-primary/50 hover:bg-red-primary/5 transition-colors"
              >
                <ImageIcon className="w-8 h-8 text-text-secondary" />
                <p className="text-sm text-text-secondary">Upload thumbnail</p>
              </button>
            )}
            <div className="flex flex-col justify-center gap-4">
              <p className="text-sm text-text-secondary">
                Upload a custom thumbnail. Recommended size: 1280x720 pixels.
              </p>
              <Button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                className="btn-secondary w-fit"
              >
                Change Thumbnail
              </Button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Details</h2>
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your content"
                className="w-full px-4 py-3 bg-hover border border-border rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-red-primary/50 focus:border-red-primary"
                maxLength={100}
              />
              <p className="text-xs text-text-secondary mt-1">{title.length}/100</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers about your content"
                rows={4}
                className="w-full px-4 py-3 bg-hover border border-border rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-red-primary/50 focus:border-red-primary resize-none"
                maxLength={5000}
              />
              <p className="text-xs text-text-secondary mt-1">{description.length}/5000</p>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Visibility</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'public', label: 'Public', icon: Globe, desc: 'Anyone can watch' },
                  { value: 'unlisted', label: 'Unlisted', icon: Clock, desc: 'Only people with link' },
                  { value: 'private', label: 'Private', icon: Lock, desc: 'Only you can watch' },
                ].map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setVisibility(value as Visibility)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                      visibility === value
                        ? 'border-red-primary bg-red-primary/5'
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${visibility === value ? 'text-red-primary' : 'text-text-secondary'}`} />
                    <div className="text-left">
                      <p className={`font-medium ${visibility === value ? 'text-red-primary' : 'text-text-primary'}`}>
                        {label}
                      </p>
                      <p className="text-xs text-text-secondary">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-text-primary mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-red-primary/10 text-red-primary text-sm rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-hover"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  id="tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tags (press Enter)"
                  className="flex-1 px-4 py-2 bg-hover border border-border rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-red-primary/50 focus:border-red-primary"
                  disabled={tags.length >= 10}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || tags.length >= 10}
                  className="btn-secondary"
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {tags.length}/10 tags • Tags help people discover your content
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/content">
            <Button type="button" className="btn-secondary">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="btn-premium"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
