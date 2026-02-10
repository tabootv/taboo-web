'use client';

import { use } from 'react';
import { CreatorHomeTab } from './_components/tabs/CreatorHomeTab';
import { useCreatorFromLayout } from './_components/useCreatorFromLayout';

interface PageProps {
  params: Promise<{ handler: string }>;
}

export default function CreatorHomePage({ params }: PageProps) {
  const { handler } = use(params);
  const { creator, isLoading } = useCreatorFromLayout(handler);

  if (isLoading || !creator) return null;

  return <CreatorHomeTab creator={creator} handler={handler} />;
}
