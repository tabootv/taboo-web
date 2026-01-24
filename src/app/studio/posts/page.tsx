'use client';

import { studioClient as studio } from '@/api/client/studio.client';
import { ContentTypeSelector } from '../_components/ContentTypeSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores';
import { Image as ImageIcon, Loader2, Mic, Send, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function CreatePostPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imagePreviewRefs = useRef<string[]>([]);
  const audioPreviewRef = useRef<string | null>(null);

  const [caption, setCaption] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [audio, setAudio] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const channel = user?.channel;

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const newImages = files.slice(0, 4 - images.length);

      for (const file of newImages) {
        if (!file.type.startsWith('image/')) {
          toast.error('Please select valid image files');
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error('Each image must be less than 10MB');
          return;
        }
      }

      setImages((prev) => [...prev, ...newImages].slice(0, 4));
      setImagePreviews((prev) => {
        const urls = newImages.map((file) => {
          const u = URL.createObjectURL(file);
          imagePreviewRefs.current.push(u);
          return u;
        });
        return [...prev, ...urls].slice(0, 4);
      });
    },
    [images.length]
  );

  const handleAudioSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast.error('Please select a valid audio file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Audio file must be less than 50MB');
        return;
      }
      setAudio(file);
      if (audioPreviewRef.current) {
        try {
          URL.revokeObjectURL(audioPreviewRef.current);
        } catch {}
        audioPreviewRef.current = null;
      }
      const u = URL.createObjectURL(file);
      audioPreviewRef.current = u;
      setAudioPreview(u);
    }
  }, []);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const removed = prev[index];
      if (removed) {
        try {
          URL.revokeObjectURL(removed);
        } catch {}
        const idx = imagePreviewRefs.current.indexOf(removed);
        if (idx >= 0) imagePreviewRefs.current.splice(idx, 1);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeAudio = () => {
    setAudio(null);
    setAudioPreview(null);
    if (audioPreviewRef.current) {
      try {
        URL.revokeObjectURL(audioPreviewRef.current);
      } catch {}
      audioPreviewRef.current = null;
    }
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      for (const u of imagePreviewRefs.current) {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      }
      imagePreviewRefs.current = [];
      if (audioPreviewRef.current) {
        try {
          URL.revokeObjectURL(audioPreviewRef.current);
        } catch {}
        audioPreviewRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!caption.trim() && images.length === 0 && !audio) {
      toast.error('Please add some content to your post');
      return;
    }

    setIsPosting(true);

    try {
      const response = await studio.createPost({
        body: caption,
        image: images[0] || null,
      });

      if (response.success) {
        toast.success('Post created successfully!');
        setTimeout(() => router.push('/community'), 1000);
      } else {
        const errorMessages = response.errors
          ? Object.values(response.errors).flat().join(', ')
          : 'Failed to create post';
        toast.error(errorMessages);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Create Post</h1>
        <p className="text-white/40">Share an update with your community</p>

        <ContentTypeSelector />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6">
            {/* Author Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#ab0013]/50">
                {channel?.dp ? (
                  <Image src={channel.dp} alt={channel.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#ab0013] to-[#7a000e] flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {channel?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-white">{channel?.name}</p>
                <p className="text-sm text-white/40">Posting as creator</p>
              </div>
            </div>

            {/* Caption Input */}
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              rows={5}
              className="w-full bg-transparent text-white placeholder:text-white/40 resize-none focus:outline-none text-lg rounded-2xl p-4"
              maxLength={2000}
              autoFocus
            />

            <div className="flex justify-end mt-2">
              <span
                className={`text-xs ${caption.length > 1800 ? 'text-yellow-500' : 'text-white/40'}`}
              >
                {caption.length}/2000
              </span>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div
                className={`mt-4 grid gap-2 ${
                  imagePreviews.length === 1
                    ? 'grid-cols-1'
                    : imagePreviews.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-2'
                }`}
              >
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className={`relative rounded-xl overflow-hidden ${
                      imagePreviews.length === 1
                        ? 'aspect-video'
                        : imagePreviews.length === 3 && index === 0
                          ? 'row-span-2 aspect-[9/16]'
                          : 'aspect-square'
                    }`}
                  >
                    <Image src={preview} alt={`Image ${index + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Audio Preview */}
            {audioPreview && (
              <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-[#ab0013]" />
                    <span className="text-sm text-white">{audio?.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeAudio}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-white/40" />
                  </button>
                </div>
                <audio src={audioPreview} controls className="w-full" />
              </div>
            )}

            {/* Media Actions */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex gap-2">
                <label
                  className={`p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer ${
                    images.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ImageIcon className="w-5 h-5 text-white/40" />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={images.length >= 4}
                    multiple
                    data-testid="studio-post-images-input"
                    className="hidden"
                  />
                </label>
                <label
                  className={`p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer ${
                    audio ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Mic className="w-5 h-5 text-white/40" />
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioSelect}
                    disabled={!!audio}
                    data-testid="studio-post-audio-input"
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                {images.length > 0 && <span>{images.length}/4 images</span>}
                {audio && <span>1 audio</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button variant="ghost" type="button" onClick={() => router.push('/studio')}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={(!caption.trim() && images.length === 0 && !audio) || isPosting}
            className="min-w-[120px]"
          >
            {isPosting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Post
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
