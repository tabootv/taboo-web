'use client';

import { PostDetailContent } from '@/features/community/components/post-detail-content';
import { use, useEffect } from 'react';
import { useDetailActive } from '../../../_context';
import { deletePostAction } from '../../../community/_actions';

export default function InterceptedPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { setActive } = useDetailActive();

  useEffect(() => {
    setActive(true);
    return () => setActive(false);
  }, [setActive]);

  return <PostDetailContent postId={Number(id)} deleteAction={deletePostAction} />;
}
