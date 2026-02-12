'use client';

import { useAuthStore } from '@/shared/stores/auth-store';
import { PenLine } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function ComposeFAB() {
  const router = useRouter();
  const pathname = usePathname();
  const isCreator = useAuthStore((s) => !!s.user?.channel);

  // Only show for creators
  if (!isCreator) return null;

  // Hide when already on compose page
  if (pathname.startsWith('/compose/')) return null;

  return (
    <button
      type="button"
      onClick={() => router.push('/compose/post', { scroll: false })}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-red-primary hover:bg-red-hover shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      aria-label="Create post"
    >
      <PenLine className="w-6 h-6 text-white" />
    </button>
  );
}
