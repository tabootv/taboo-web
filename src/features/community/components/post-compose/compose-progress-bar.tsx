'use client';

import { useComposeStore } from '@/shared/stores/compose-store';

export function ComposeProgressBar() {
  const isPublishing = useComposeStore((s) => s.isPublishing);

  if (!isPublishing) return null;

  return (
    <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden rounded-t-xl z-10">
      <div className="h-full w-1/3 bg-blue-500 rounded-full animate-[slide_1.5s_ease-in-out_infinite]" />
      <style>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
