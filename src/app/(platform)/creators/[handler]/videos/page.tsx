'use client';

import { use } from 'react';
import { redirect } from 'next/navigation';
import { CreatorVideosTab } from '../_components/tabs/CreatorVideosTab';
import { useCreatorFromLayout } from '../_components/useCreatorFromLayout';

interface PageProps {
  params: Promise<{ handler: string }>;
}

export default function CreatorVideosPage({ params }: PageProps) {
  const { handler } = use(params);
  const { creator, isLoading } = useCreatorFromLayout(handler);

  if (isLoading || !creator) return null;

  if (creator.videos_count === 0) {
    redirect(`/creators/${handler}`);
  }

  return <CreatorVideosTab creator={creator} />;
}
