'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  Check,
  AlertCircle,
  Globe,
  Lock,
  Tag,
  FileVideo,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores';
import { studio } from '@/lib/api';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function UploadVideoPage() {
  const router = useRouter();
  useAuthStore(); // Verify user is authenticated
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<string | null>(null);
  const thumbnailPreviewRef = useRef<string | null>(null);

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
      if (file.size > 2 * 1024 * 1024 * 1024) {
        toast.error('Video file must be less than 2GB');
        return;
      }
      setVideoFile(file);
      // revoke previous preview if present
      if (videoPreviewRef.current) {
        try { URL.revokeObjectURL(videoPreviewRef.current); } catch {}
        videoPreviewRef.current = null;
      }
      const url = URL.createObjectURL(file);
      videoPreviewRef.current = url;
      setVideoPreview(url);
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
      if (thumbnailPreviewRef.current) {
        try { URL.revokeObjectURL(thumbnailPreviewRef.current); } catch {}
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
      try { URL.revokeObjectURL(videoPreviewRef.current); } catch {}
      videoPreviewRef.current = null;
    }
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleRemoveThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    if (thumbnailPreviewRef.current) {
      try { URL.revokeObjectURL(thumbnailPreviewRef.current); } catch {}
      thumbnailPreviewRef.current = null;
    }
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoPreviewRef.current) {
        try { URL.revokeObjectURL(videoPreviewRef.current); } catch {}
        videoPreviewRef.current = null;
      }
      if (thumbnailPreviewRef.current) {
        try { URL.revokeObjectURL(thumbnailPreviewRef.current); } catch {}
        thumbnailPreviewRef.current = null;
      }
    };
  }, []);

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
          return prev + 10;
        });
      }, 500);

      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);

      const response = await studio.uploadVideo({
        file: videoFile,
        thumbnail: thumbnail || null,
        title,
        ...(description && { description }),
        ...(tagArray.length > 0 && { tags: tagArray }),
        is_nsfw: isNsfw,
      });

      clearInterval(progressInterval);

      if (response.success) {
        setUploadProgress(100);
        toast.success('Video uploaded successfully!');
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
      setUploadError('Failed to upload video. Please try again.');
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Upload Video</h1>
        <p className="text-white/40">Share your content with your audience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Upload */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <FileVideo className="w-5 h-5 text-[#ab0013]" />
              Video File
            </h2>

            {!videoFile ? (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-[#ab0013]/50 hover:bg-[#ab0013]/5 transition-all">
                  <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">Drag and drop your video here</p>
                  <p className="text-white/40 text-sm mb-4">or click to browse</p>
                  <p className="text-xs text-white/40">MP4, MOV, AVI up to 2GB</p>
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  data-testid="studio-video-input"
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                  <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  <video data-testid="studio-video-preview" src={videoPreview || undefined} className="w-full h-full object-contain" controls />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  data-testid="remove-video-btn"
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <p className="mt-3 text-sm text-white/40">
                  {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Thumbnail */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#ab0013]" />
              Thumbnail
            </h2>
            <div className="flex gap-4 items-start">
              {thumbnailPreview ? (
                <div className="relative w-48 aspect-video rounded-lg overflow-hidden">
                  <Image data-testid="studio-thumbnail-preview" src={thumbnailPreview} alt="Thumbnail preview" fill className="object-cover" />
                  <button
                    type="button"
                    data-testid="remove-thumbnail-btn"
                    onClick={handleRemoveThumbnail}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <label className="w-48 aspect-video border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#ab0013]/50 hover:bg-[#ab0013]/5 transition-all">
                  <ImageIcon className="w-6 h-6 text-white/40 mb-2" />
                  <span className="text-xs text-white/40">Add thumbnail</span>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailSelect}
                    className="hidden"
                  />
                </label>
              )}
              <p className="text-sm text-white/40 flex-1">
                Upload a custom thumbnail or we'll generate one from your video. Recommended: 1280x720 (16:9)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-white mb-4">Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Title <span className="text-[#ab0013]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#ab0013] transition-colors"
                  maxLength={100}
                />
                <p className="mt-1 text-xs text-white/40 text-right">{title.length}/100</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell viewers about your video"
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#ab0013] transition-colors resize-none"
                  maxLength={5000}
                />
                <p className="mt-1 text-xs text-white/40 text-right">{description.length}/5000</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Add tags separated by commas"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#ab0013] transition-colors"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visibility */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-white mb-4">Visibility</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === 'public'}
                  onChange={() => setVisibility('public')}
                  className="w-4 h-4 accent-[#ab0013]"
                />
                <Globe className="w-5 h-5 text-white/40" />
                <div>
                  <p className="text-white font-medium">Public</p>
                  <p className="text-sm text-white/40">Everyone can watch this video</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === 'private'}
                  onChange={() => setVisibility('private')}
                  className="w-4 h-4 accent-[#ab0013]"
                />
                <Lock className="w-5 h-5 text-white/40" />
                <div>
                  <p className="text-white font-medium">Private</p>
                  <p className="text-sm text-white/40">Only you can watch this video</p>
                </div>
              </label>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-white font-medium">Age-restricted content (18+)</p>
                  <p className="text-sm text-white/40">Mark this video as not suitable for younger audiences</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNsfw(!isNsfw)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isNsfw ? 'bg-[#ab0013]' : 'bg-white/20'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isNsfw ? 'left-7' : 'left-1'}`} />
                </button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Upload Progress */}
        {isUploading && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Loader2 className="w-5 h-5 text-[#ab0013] animate-spin" />
                <span className="text-white font-medium">Uploading video...</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#ab0013] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
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
          <Button type="submit" disabled={!videoFile || !title.trim() || isUploading} className="min-w-[140px]">
            {isUploading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...</>
            ) : uploadProgress === 100 ? (
              <><Check className="w-4 h-4 mr-2" /> Uploaded!</>
            ) : (
              <><Upload className="w-4 h-4 mr-2" /> Upload Video</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
