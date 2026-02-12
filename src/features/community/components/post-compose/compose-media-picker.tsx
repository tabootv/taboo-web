'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { MentionInputHandle } from '@/features/video/components/_comments/mention-input';
import { useComposeStore } from '@/shared/stores/compose-store';
import { Theme as EmojiTheme } from 'emoji-picker-react';
import { ImageIcon, Smile } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface ComposeMediaPickerProps {
  mentionRef: React.RefObject<MentionInputHandle | null>;
  showLocation: boolean;
  onToggleLocation: () => void;
}

export function ComposeMediaPicker({
  mentionRef,
  showLocation: _showLocation,
  onToggleLocation: _onToggleLocation,
}: ComposeMediaPickerProps) {
  const addImages = useComposeStore((s) => s.addImages);
  // const addAudioFiles = useComposeStore((s) => s.addAudioFiles);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  // const audioInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      addImages(Array.from(files));
    }
    e.target.value = '';
  };

  // const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = e.target.files;
  //   if (files?.length) {
  //     addAudioFiles(Array.from(files));
  //   }
  //   e.target.value = '';
  // };

  return (
    <div className="flex items-center gap-1">
      <label className="p-2 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-white/5 transition-colors cursor-pointer">
        <ImageIcon className="w-5 h-5" />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="hidden"
        />
      </label>

      {/* <label className="p-2 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-white/5 transition-colors cursor-pointer">
        <Mic className="w-5 h-5" />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={handleAudioChange}
          className="hidden"
        />
      </label> */}

      <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="p-2 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-white/5 transition-colors"
          >
            <Smile className="w-5 h-5" />
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

      {/* <button
        type="button"
        onClick={onToggleLocation}
        className={`p-2 rounded-lg transition-colors ${
          showLocation
            ? 'text-red-primary bg-red-primary/10'
            : 'text-text-tertiary hover:text-text-secondary hover:bg-white/5'
        }`}
      >
        <MapPin className="w-5 h-5" />
      </button> */}
    </div>
  );
}
