'use client';

import { use } from 'react';
import { redirect } from 'next/navigation';
import { CreatorEducationTab } from '../_components/tabs/CreatorEducationTab';
import { useCreatorFromLayout } from '../_components/useCreatorFromLayout';

interface PageProps {
  params: Promise<{ handler: string }>;
}

export default function CreatorEducationPage({ params }: PageProps) {
  const { handler } = use(params);
  const { creator, isLoading } = useCreatorFromLayout(handler);

  if (isLoading || !creator) return null;

  if (creator.course_count === 0) {
    redirect(`/creators/${handler}`);
  }

  return <CreatorEducationTab creator={creator} />;
}
