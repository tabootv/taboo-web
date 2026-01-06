'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { postsClient as postsApi } from '@/api/client';
import type { Post } from '@/types';
import { toast } from 'sonner';

interface CreatePostProps {
  onPostCreated: (post: Post) => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [showImage, setShowImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPostImage(file);
      setShowImage(URL.createObjectURL(file));
    }
  };

  const handleFileEmpty = () => {
    setPostImage(null);
    setShowImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const submitPost = async () => {
    if (!postText.trim()) {
      setErrors(['Post cannot be empty. Please add text.']);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const newPost = await postsApi.create(postText, postImage || undefined);
      onPostCreated(newPost);
      toast.success('Post created successfully!');
      setPostText('');
      setPostImage(null);
      setShowImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setErrors(['An error occurred while creating the post. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="right-div-community">
      <div className="border-post">
        {/* Form */}
        <div className="form-group">
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="Write something..."
            className="textarea"
            rows={4}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="form-group mb-0 flex gap-3 items-center">
            {!showImage ? (
              <label htmlFor="postImage" className="file-label cursor-pointer">
                <input
                  ref={fileInputRef}
                  id="postImage"
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.gif"
                  onChange={handleFileChange}
                />
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 cursor-pointer"
                >
                  <rect width="40" height="40" rx="8" fill="#2A2A2A" />
                  <path
                    d="M25 14H15C13.8954 14 13 14.8954 13 16V24C13 25.1046 13.8954 26 15 26H25C26.1046 26 27 25.1046 27 24V16C27 14.8954 26.1046 14 25 14Z"
                    stroke="#9F9F9F"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17.5 19C18.3284 19 19 18.3284 19 17.5C19 16.6716 18.3284 16 17.5 16C16.6716 16 16 16.6716 16 17.5C16 18.3284 16.6716 19 17.5 19Z"
                    stroke="#9F9F9F"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M27 22L23.5 18.5L15 26"
                    stroke="#9F9F9F"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </label>
            ) : (
              <div className="relative">
                <Image
                  src={showImage}
                  alt="Uploaded Image"
                  width={64}
                  height={64}
                  className="w-auto h-16 object-contain rounded"
                />
                <button
                  onClick={handleFileEmpty}
                  className="absolute -right-2 -top-5 text-[#AB0013] font-bold text-[24px] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={submitPost}
            className="submit-button max-w-[115px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="error-messages mt-4">
            {errors.map((error, index) => (
              <p key={index} className="error text-red-500 text-sm">
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
