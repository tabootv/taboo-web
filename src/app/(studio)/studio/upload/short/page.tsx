'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Upload,
  Film,
  Image as ImageIcon,
  X,
  Loader2,
  Check,
  AlertCircle,
  Globe,
  Lock,
  Tag,
  Clock,
  Smartphone,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores';
import { studio } from '@/lib/api';
import { Button } from '@/components/ui';
import { toast } from 'sonner';

export default function UploadShortPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [isNsfw, setIsNsfw] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
      setVideoPreview(URL.createObjectURL(file));
      if (!title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setTitle(nameWithoutExt);
      }
    }
  }, [title]);

  const handleThumbnailSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleRemoveThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
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

      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);

      const response = await studio.uploadShort({
        file: videoFile,
        thumbnail: thumbnail || undefined,
        title,
        description: description || undefined,
        tags: tagArray.length > 0 ? tagArray : undefined,
        is_nsfw: isNsfw,
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
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Upload Short</h1>
        <p className="text-text-secondary">Create quick, engaging vertical videos</p>
      </div>

      {/* Tips Banner */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
        <div className="flex gap-4">
          <div className="p-2 rounded-xl bg-purple-500/10 h-fit">
            <Smartphone className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-medium text-white mb-1">Tips for great Shorts</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li className="flex items-center gap-2"><Clock className="w-3 h-3" /> Keep it under 60 seconds</li>
              <li className="flex items-center gap-2"><Smartphone className="w-3 h-3" /> Use vertical format (9:16)</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Upload */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Film className="w-5 h-5 text-purple-400" />
            Short Video
          </h2>

          {!videoFile ? (
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-purple-500/50 hover:bg-purple-500/5 transition-all">
                <Upload className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                <p className="text-white font-medium mb-2">Drag and drop your short video here</p>
                <p className="text-text-secondary text-sm mb-4">or click to browse</p>
                <p className="text-xs text-text-secondary">Vertical video (9:16) recommended • Up to 60 seconds • Max 500MB</p>
              </div>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex gap-6">
              <div className="relative w-[200px] flex-shrink-0">
                <div className="aspect-[9/16] rounded-xl overflow-hidden bg-black">
                  <video src={videoPreview || undefined} className="w-full h-full object-cover" controls />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium mb-2">{videoFile.name}</p>
                <p className="text-sm text-text-secondary mb-4">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-white mb-2">Custom Thumbnail</label>
                  {thumbnailPreview ? (
                    <div className="relative w-24 aspect-[9/16] rounded-lg overflow-hidden">
                      <Image src={thumbnailPreview} alt="Thumbnail" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={handleRemoveThumbnail}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 aspect-[9/16] border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 transition-all">
                      <ImageIcon className="w-5 h-5 text-text-secondary mb-1" />
                      <span className="text-xs text-text-secondary">Add</span>
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
        </div>

        {/* Details */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-white mb-4">Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Title <span className="text-red-primary">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter short title"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-purple-500 transition-colors"
                maxLength={100}
              />
              <p className="mt-1 text-xs text-text-secondary text-right">{title.length}/100</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description"
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-purple-500 transition-colors resize-none"
                maxLength={500}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Add tags (comma separated)"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-white mb-4">Visibility</h2>
          <div className="flex gap-4">
            <label className="flex-1 flex items-center gap-3 p-4 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
                className="w-4 h-4 accent-purple-500"
              />
              <Globe className="w-5 h-5 text-text-secondary" />
              <span className="text-white font-medium">Public</span>
            </label>
            <label className="flex-1 flex items-center gap-3 p-4 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
                className="w-4 h-4 accent-purple-500"
              />
              <Lock className="w-5 h-5 text-text-secondary" />
              <span className="text-white font-medium">Private</span>
            </label>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-white font-medium">Age-restricted (18+)</p>
                <p className="text-sm text-text-secondary">Not suitable for younger audiences</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNsfw(!isNsfw)}
                className={`relative w-12 h-6 rounded-full transition-colors ${isNsfw ? 'bg-purple-500' : 'bg-white/20'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isNsfw ? 'left-7' : 'left-1'}`} />
              </button>
            </label>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              <span className="text-white font-medium">Uploading short...</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="mt-2 text-sm text-text-secondary">{uploadProgress}% complete</p>
          </div>
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
            disabled={!videoFile || !title.trim() || isUploading}
            className="min-w-[140px] bg-purple-600 hover:bg-purple-700"
          >
            {isUploading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...</>
            ) : uploadProgress === 100 ? (
              <><Check className="w-4 h-4 mr-2" /> Uploaded!</>
            ) : (
              <><Upload className="w-4 h-4 mr-2" /> Upload Short</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
