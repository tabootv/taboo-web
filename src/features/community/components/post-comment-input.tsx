'use client';

import { Avatar } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { MentionInputHandle } from '@/features/video/components/_comments/mention-input';
import { MentionInput } from '@/features/video/components/_comments/mention-input';
import { Theme as EmojiTheme } from 'emoji-picker-react';
import { AtSign, Smile } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface PostCommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isPending?: boolean;
  placeholder?: string;
  avatarSrc?: string | null | undefined;
  avatarFallback?: string;
  variant?: 'main' | 'reply';
}

export function PostCommentInput({
  value,
  onChange,
  onSubmit,
  isPending,
  placeholder = 'Add a comment...',
  avatarSrc,
  avatarFallback = 'U',
  variant = 'main',
}: PostCommentInputProps) {
  const mentionRef = useRef<MentionInputHandle>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  if (variant === 'reply') {
    return (
      <div className="rounded-xl bg-[#0d0d0d] transition-colors animate-in slide-in-from-top-2">
        <div className="p-3 pb-0">
          <MentionInput
            ref={mentionRef}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={2}
            className="w-full bg-transparent outline-none resize-none text-sm text-white placeholder:text-text-tertiary border-b border-transparent focus:border-b-text-secondary transition-colors"
          />
        </div>

        <div className="border-t border-[#1f1f1f] mx-3" />

        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-1">
            <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-white/5 transition-colors"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="start"
                className="w-auto p-0 border-none bg-transparent shadow-none"
              >
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    mentionRef.current?.insertAtCursor(emojiData.emoji);
                    setEmojiOpen(false);
                  }}
                  theme={EmojiTheme.DARK}
                  height={350}
                  width={300}
                  searchDisabled
                  skinTonesDisabled
                  previewConfig={{ showPreview: false }}
                />
              </PopoverContent>
            </Popover>

            <button
              type="button"
              onClick={() => mentionRef.current?.insertAtCursor('@')}
              className="p-1.5 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-white/5 transition-colors"
            >
              <AtSign className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onSubmit}
            disabled={isPending || !value.trim()}
            className="px-3 py-1.5 rounded-full bg-red-primary text-white text-xs font-medium hover:bg-red-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Reply
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <Avatar src={avatarSrc ?? null} alt="You" fallback={avatarFallback} size="sm" />

      <div className="flex-1 rounded-xl bg-[#0d0d0d] transition-colors">
        <div className="p-3 pb-0">
          <MentionInput
            ref={mentionRef}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-transparent outline-none resize-none text-sm text-white placeholder:text-text-tertiary border-b border-transparent focus:border-b-text-secondary transition-colors"
          />
        </div>

        <div className="border-t border-[#1f1f1f] mx-3" />

        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-1">
            <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-white/5 transition-colors"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="start"
                className="w-auto p-0 border-none bg-transparent shadow-none"
              >
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    mentionRef.current?.insertAtCursor(emojiData.emoji);
                    setEmojiOpen(false);
                  }}
                  theme={EmojiTheme.DARK}
                  height={350}
                  width={300}
                  searchDisabled
                  skinTonesDisabled
                  previewConfig={{ showPreview: false }}
                />
              </PopoverContent>
            </Popover>

            <button
              type="button"
              onClick={() => mentionRef.current?.insertAtCursor('@')}
              className="p-1.5 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-white/5 transition-colors"
            >
              <AtSign className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onSubmit}
            disabled={isPending || !value.trim()}
            className="px-4 py-1.5 rounded-full bg-red-primary text-white text-xs font-medium hover:bg-red-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
