'use client';

import { PostDetailContent } from '@/features/community/components/post-detail-content';
import { use } from 'react';
import { deletePostAction } from './_actions';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <PostDetailContent postId={Number(id)} deleteAction={deletePostAction} />;
}
