'use client';

import { use } from 'react';
import { redirect } from 'next/navigation';
import { CreatorSeriesTab } from '../_components/tabs/CreatorSeriesTab';
import { useCreatorFromLayout } from '../_components/useCreatorFromLayout';

interface PageProps {
  params: Promise<{ handler: string }>;
}

export default function CreatorSeriesPage({ params }: PageProps) {
  const { handler } = use(params);
  const { creator, isLoading } = useCreatorFromLayout(handler);

  if (isLoading || !creator) return null;

  if (creator.series_count === 0) {
    redirect(`/creators/${handler}`);
  }

  return <CreatorSeriesTab creator={creator} />;
}
