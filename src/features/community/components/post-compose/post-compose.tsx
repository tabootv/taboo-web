'use client';

import { useCreatePost } from '@/api/mutations';
import type { MentionInputHandle } from '@/features/video/components/_comments/mention-input';
import { MentionInput } from '@/features/video/components/_comments/mention-input';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useComposeStore } from '@/shared/stores/compose-store';
import type { Post } from '@/types';
import { Loader2, Send, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ComposeMediaPicker } from './compose-media-picker';
import { ComposeMediaPreview } from './compose-media-preview';
import { ComposeProgressBar } from './compose-progress-bar';

const LocationPicker = dynamic(
  () => import('@/app/studio/_components/LocationPicker').then((mod) => mod.LocationPicker),
  { ssr: false }
);

interface PostComposeProps {
  variant: 'inline' | 'modal';
  onSuccess?: (post: Post) => void;
  onClose?: () => void;
}

export function PostCompose({ variant, onSuccess, onClose }: PostComposeProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const createPost = useCreatePost();
  const mentionRef = useRef<MentionInputHandle>(null);

  const draft = useComposeStore((s) => s.draft);
  const isPublishing = useComposeStore((s) => s.isPublishing);
  const setCaption = useComposeStore((s) => s.setCaption);
  const setLocation = useComposeStore((s) => s.setLocation);
  const setPublishing = useComposeStore((s) => s.setPublishing);
  const resetDraft = useComposeStore((s) => s.resetDraft);

  const [isExpanded, setIsExpanded] = useState(variant === 'modal');
  const [showLocation, setShowLocation] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!draft.caption.trim() || isPublishing) return;

    setPublishing(true);
    try {
      const post = await createPost.mutateAsync({
        caption: draft.caption,
        ...(draft.images.length > 0 && { images: draft.images }),
        ...(draft.audioFiles.length > 0 && { audioFiles: draft.audioFiles }),
        ...(draft.location && { location: draft.location }),
        ...(draft.latitude != null && { latitude: draft.latitude }),
        ...(draft.longitude != null && { longitude: draft.longitude }),
      });

      resetDraft();
      setShowLocation(false);
      if (variant === 'inline') setIsExpanded(false);

      toast.success('Your post was sent.', {
        action: {
          label: 'View',
          onClick: () => router.push(`/posts/${post.id}`, { scroll: false }),
        },
      });

      onSuccess?.(post);
      if (variant === 'modal') onClose?.();
    } catch {
      toast.error('Failed to create post');
    } finally {
      setPublishing(false);
    }
  }, [
    draft,
    isPublishing,
    setPublishing,
    createPost,
    resetDraft,
    variant,
    onSuccess,
    onClose,
    router,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Inline variant: collapsed state
  if (variant === 'inline' && !isExpanded) {
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
          <button
            onClick={() => setIsExpanded(true)}
            className="flex-1 text-left py-2.5 px-4 rounded-full bg-white/5 text-text-secondary hover:bg-white/10 transition-colors text-[15px]"
          >
            What&apos;s on your mind?
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={variant === 'inline' ? 'community-post-card' : ''}>
      <div className="relative">
        <ComposeProgressBar />

        {/* Modal header */}
        {variant === 'modal' ? (
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
            <h2 className="text-base font-semibold text-white">New Post</h2>
            <div className="w-9" /> {/* Spacer for center alignment */}
          </div>
        ) : null}

        <div
          className={`${variant === 'modal' ? 'pt-4' : ''} ${isPublishing ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="flex gap-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-white/10">
              {user?.dp ? (
                <Image
                  src={user.dp}
                  alt={user.display_name || 'You'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-red-primary to-red-dark flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {(user?.display_name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <MentionInput
                ref={mentionRef}
                value={draft.caption}
                onChange={setCaption}
                onKeyDown={handleKeyDown}
                placeholder="What's on your mind?"
                rows={variant === 'modal' ? 5 : 3}
                className="w-full bg-transparent outline-none resize-none text-[15px] text-white placeholder:text-text-secondary"
              />
            </div>
          </div>

          {/* Media Preview */}
          <div className="mt-3 pl-14">
            <ComposeMediaPreview />
          </div>

          {/* Location Picker */}
          {showLocation ? (
            <div className="mt-3 pl-14 animate-in slide-in-from-top-2">
              <LocationPicker
                value={draft.location}
                countryId={null}
                onLocationChange={(location, details) => {
                  setLocation(location, details.latitude, details.longitude);
                }}
              />
            </div>
          ) : null}

          {/* Toolbar */}
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
            <ComposeMediaPicker
              mentionRef={mentionRef}
              showLocation={showLocation}
              onToggleLocation={() => setShowLocation((v) => !v)}
            />

            <div className="flex gap-2">
              {variant === 'inline' ? (
                <button
                  type="button"
                  onClick={() => {
                    resetDraft();
                    setIsExpanded(false);
                    setShowLocation(false);
                  }}
                  className="px-4 py-2 text-text-secondary hover:text-white transition-colors text-sm"
                >
                  Cancel
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!draft.caption.trim() || isPublishing}
                className="px-5 py-2 bg-red-primary hover:bg-red-hover text-white rounded-full font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isPublishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
