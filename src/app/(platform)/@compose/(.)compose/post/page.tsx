'use client';

import { PostCompose } from '@/features/community';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export default function InterceptedComposePage() {
  const router = useRouter();

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in-0 duration-200">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-[600px] mx-4 bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <PostCompose variant="modal" onClose={handleClose} />
      </div>
    </div>
  );
}
