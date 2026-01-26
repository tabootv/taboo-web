'use client';

import { FileText, Film, Video } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type ContentType = 'video' | 'short' | 'post';

interface ContentTypeItem {
  name: string;
  href: string;
  icon: typeof Video;
  type: ContentType;
}

const contentTypes: ContentTypeItem[] = [
  { name: 'Video', href: '/studio/upload/video', icon: Video, type: 'video' },
  { name: 'Short', href: '/studio/upload/short', icon: Film, type: 'short' },
  { name: 'Post', href: '/studio/posts', icon: FileText, type: 'post' },
];

const activeColors: Record<ContentType, string> = {
  video: 'bg-red-primary',
  short: 'bg-red-primary',
  post: 'bg-red-primary',
};

export function ContentTypeSelector() {
  const pathname = usePathname();

  const getActiveType = (): ContentType | null => {
    if (pathname.includes('/upload/video')) return 'video';
    if (pathname.includes('/upload/short')) return 'short';
    if (pathname.includes('/posts')) return 'post';
    return null;
  };

  const activeType = getActiveType();

  return (
    <div className="flex gap-2 mt-4">
      {contentTypes.map((type) => {
        const isActive = activeType === type.type;
        const activeColor = activeType ? activeColors[activeType] : 'bg-purple-600';

        return (
          <Link
            key={type.name}
            href={type.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isActive
                ? `${activeColor} text-white`
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <type.icon className="w-4 h-4" />
            {type.name}
          </Link>
        );
      })}
    </div>
  );
}
