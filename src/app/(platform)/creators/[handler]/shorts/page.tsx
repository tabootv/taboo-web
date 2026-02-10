'use client';

import { use } from 'react';
import { redirect } from 'next/navigation';
import { CreatorShortsTab } from '../_components/tabs/CreatorShortsTab';
import { useCreatorFromLayout } from '../_components/useCreatorFromLayout';

interface PageProps {
  params: Promise<{ handler: string }>;
}

export default function CreatorShortsPage({ params }: PageProps) {
  const { handler } = use(params);
  const { creator, isLoading } = useCreatorFromLayout(handler);

  if (isLoading || !creator) return null;

  if (creator.short_videos_count === 0) {
    redirect(`/creators/${handler}`);
  }

  return <CreatorShortsTab creator={creator} />;
}
