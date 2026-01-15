'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Upload,
  Video,
  Film,
  X,
  ImageIcon,
  Globe,
  Lock,
  Clock,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { Button, LoadingScreen } from '@/components/ui';
import { toast } from 'sonner';

type ContentType = 'video' | 'short';
type Visibility = 'public' | 'private' | 'unlisted';

export default function CreateContentPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [contentType, setContentType] = useState<ContentType>('video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [_thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    // Validate file size (max 2GB)
    if (file.size > 2 * 1024 * 1024 * 1024) {
      toast.error('Video file must be less than 2GB');
      return;
    }

    setVideoFile(file);

    // Get video duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      setVideoDuration(Math.floor(video.duration));
      URL.revokeObjectURL(video.src);
    };
    video.src = URL.createObjectURL(file);
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
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

    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    // Validate short duration (max 60 seconds)
    if (contentType === 'short' && videoDuration > 60) {
      toast.error('Shorts must be 60 seconds or less');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement API call when endpoint is available
      // const formData = new FormData();
      // formData.append('video', videoFile);
      // formData.append('title', title);
      // formData.append('description', description);
      // formData.append('visibility', visibility);
      // formData.append('type', contentType);
      // formData.append('tags', JSON.stringify(tags));
      // if (thumbnailFile) {
      //   formData.append('thumbnail', thumbnailFile);
      // }
      // await apiClient.post('/content/upload', formData);

      toast.info('Content upload coming soon. Backend integration in progress.');

      // Simulate success for demo
      // router.push('/content');
    } catch (error) {
      console.error('Failed to upload content:', error);
      toast.error('Failed to upload content. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/content"
          className="p-2 hover:bg-hover rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Create New Content</h1>
          <p className="text-sm text-text-secondary mt-1">Upload a video or short</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Content Type Selection */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Content Type</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setContentType('video')}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-colors ${
                contentType === 'video'
                  ? 'border-red-primary bg-red-primary/5'
                  : 'border-border hover:border-border-hover'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  contentType === 'video' ? 'bg-red-primary' : 'bg-border'
                }`}
              >
                <Video className={`w-6 h-6 ${contentType === 'video' ? 'text-white' : 'text-text-secondary'}`} />
              </div>
              <div className="text-center">
                <p className={`font-semibold ${contentType === 'video' ? 'text-red-primary' : 'text-text-primary'}`}>
                  Video
                </p>
                <p className="text-sm text-text-secondary">Long-form content</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setContentType('short')}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-colors ${
                contentType === 'short'
                  ? 'border-red-primary bg-red-primary/5'
                  : 'border-border hover:border-border-hover'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  contentType === 'short' ? 'bg-red-primary' : 'bg-border'
                }`}
              >
                <Film className={`w-6 h-6 ${contentType === 'short' ? 'text-white' : 'text-text-secondary'}`} />
              </div>
              <div className="text-center">
                <p className={`font-semibold ${contentType === 'short' ? 'text-red-primary' : 'text-text-primary'}`}>
                  Short
                </p>
                <p className="text-sm text-text-secondary">60 seconds or less</p>
              </div>
            </button>
          </div>
        </div>

        {/* Video Upload */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Video File</h2>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
          {videoFile ? (
            <div className="flex items-center gap-4 p-4 bg-hover rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-red-primary/10 flex items-center justify-center">
                <Video className="w-6 h-6 text-red-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">{videoFile.name}</p>
                <p className="text-sm text-text-secondary">
                  {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                  {videoDuration > 0 && ` • ${Math.floor(videoDuration / 60)}:${(videoDuration % 60).toString().padStart(2, '0')}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVideoFile(null);
                  setVideoDuration(0);
                }}
                className="p-2 hover:bg-border rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="w-full flex flex-col items-center gap-4 p-8 border-2 border-dashed border-border rounded-xl hover:border-red-primary/50 hover:bg-red-primary/5 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-border flex items-center justify-center">
                <Upload className="w-8 h-8 text-text-secondary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-text-primary">Click to upload</p>
                <p className="text-sm text-text-secondary mt-1">
                  MP4, MOV, AVI up to 2GB
                  {contentType === 'short' && ' • Max 60 seconds'}
                </p>
              </div>
            </button>
          )}
          {contentType === 'short' && videoDuration > 60 && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">This video is too long for a short. Shorts must be 60 seconds or less.</p>
            </div>
          )}
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
            {thumbnailPreview ? (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  fill
                  className="object-cover"
                />
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
            <div className="flex flex-col justify-center">
              <p className="text-sm text-text-secondary">
                Upload a custom thumbnail or one will be generated automatically.
                Recommended size: 1280x720 pixels.
              </p>
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
            disabled={isSubmitting || !videoFile || !title.trim() || (contentType === 'short' && videoDuration > 60)}
            className="btn-premium"
          >
            {isSubmitting ? 'Uploading...' : 'Upload Content'}
          </Button>
        </div>
      </form>
    </div>
  );
}
