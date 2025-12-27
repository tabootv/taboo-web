'use client';

import { ImageIcon, Loader2, Mic, Send } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface CreatePostCardProps {
  user: any;
  onPostCreated: (caption: string, image?: File) => void | Promise<void>;
}

export function CreatePostCard({ user, onPostCreated }: CreatePostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | undefined>();

  const handleSubmit = async () => {
    if (!caption.trim()) return;

    setIsPosting(true);
    try {
      await onPostCreated(caption, selectedImage);
      setCaption('');
      setSelectedImage(undefined);
      setIsExpanded(false);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  return (
    <div className="community-post-card">
      <div className="flex gap-3">
        <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-white/10">
          {user?.dp ? (
            <Image src={user.dp} alt={user.display_name || 'You'} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-red-primary to-red-dark flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {(user?.display_name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1">
          {isExpanded ? (
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-transparent text-white placeholder:text-text-secondary resize-none focus:outline-none min-h-[100px] text-[15px]"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full text-left py-2.5 px-4 rounded-full bg-white/5 text-text-secondary hover:bg-white/10 transition-colors text-[15px]"
            >
              What&apos;s on your mind?
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex gap-1">
            <label className="p-2.5 rounded-xl hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer">
              <ImageIcon className="w-5 h-5" />
              <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </label>
            <button className="p-2.5 rounded-xl hover:bg-white/10 text-text-secondary hover:text-white transition-colors">
              <Mic className="w-5 h-5" />
            </button>
          </div>
          {selectedImage && <div className="text-xs text-text-secondary">{selectedImage.name}</div>}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsExpanded(false);
                setCaption('');
              }}
              className="px-4 py-2 text-text-secondary hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!caption.trim() || isPosting}
              className="px-5 py-2 bg-red-primary hover:bg-red-hover text-white rounded-full font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isPosting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
