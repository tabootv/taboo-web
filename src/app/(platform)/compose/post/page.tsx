'use client';

import { PostCompose } from '@/features/community';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ComposePostPage() {
  return (
    <div className="relative z-10 mx-auto page-px py-12">
      <div className="max-w-[600px] mx-auto">
        <div className="mb-6">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community
          </Link>
        </div>

        <div className="bg-surface border border-white/10 rounded-2xl p-6">
          <PostCompose variant="modal" />
        </div>
      </div>
    </div>
  );
}
