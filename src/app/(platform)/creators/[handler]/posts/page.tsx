'use client';

import { use } from 'react';
import { redirect } from 'next/navigation';
import { CreatorPostsTab } from '../_components/tabs/CreatorPostsTab';
import { useCreatorFromLayout } from '../_components/useCreatorFromLayout';

interface PageProps {
  params: Promise<{ handler: string }>;
}

export default function CreatorPostsPage({ params }: PageProps) {
  const { handler } = use(params);
  const { creator, isLoading } = useCreatorFromLayout(handler);

  if (isLoading || !creator) return null;

  if (creator.posts_count === 0) {
    redirect(`/creators/${handler}`);
  }

  return <CreatorPostsTab creator={creator} />;
}
