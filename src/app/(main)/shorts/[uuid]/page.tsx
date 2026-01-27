'use client';

import { use } from 'react';
import { ShortsFeedContainer } from '../_components/shorts-feed-container';
import '../shorts-feed.css';

interface Props {
  params: Promise<{ uuid: string }>;
}

export default function ShortPage({ params }: Props) {
  const { uuid } = use(params);
  return <ShortsFeedContainer initialUuid={uuid} />;
}
