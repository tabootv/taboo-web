'use client';

import { Send } from 'lucide-react';
import Image from 'next/image';
import type { User } from '@/types';
import { MentionInput } from './mention-input';

interface CommentInputProps {
  user: User | null;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
  placeholder?: string;
  variant?: 'default' | 'reply';
  replyingTo?: string;
}

export function CommentInput({
  user,
  value,
  onChange,
  onSubmit,
  isPending,
  placeholder = 'Add Comment',
  variant = 'default',
  replyingTo,
}: CommentInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  if (variant === 'reply') {
    return (
      <div className="mt-4">
        {replyingTo && <p className="text-xs text-white/50 mb-2">Replying to @{replyingTo}</p>}
        <div className="flex items-end gap-2">
          <MentionInput
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="flex-1 bg-transparent border-b border-white/30 focus:border-white/60 outline-none resize-none py-2 text-white placeholder:text-white/50"
          />
          <button
            onClick={onSubmit}
            disabled={isPending || !value.trim()}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 mt-3 mb-3 md:my-5">
      <div className="relative size-[36px] md:size-[40px] rounded-full overflow-hidden bg-surface flex-shrink-0 border border-border">
        {user?.dp ? (
          <Image src={user.dp} alt={user.display_name || 'You'} fill className="object-cover" />
        ) : (
          <div className="size-full flex items-center justify-center bg-red-primary text-white text-xs md:text-sm font-medium">
            {user?.display_name?.charAt(0) || 'U'}
          </div>
        )}
      </div>

      <div className="flex items-center w-full">
        <MentionInput
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="w-full bg-surface/60 border border-border focus:border-white/20 focus:outline-none rounded-full resize-none py-2.5 px-4 text-sm text-white placeholder:text-white/60 transition-colors"
        />
        <button
          onClick={onSubmit}
          disabled={isPending || !value.trim()}
          className="p-2 ml-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
