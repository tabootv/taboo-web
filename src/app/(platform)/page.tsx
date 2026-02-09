import { fetchHomeData } from '@/shared/lib/api/home-data';
import type { Metadata } from 'next';
import { HomeContent } from './_home/home-content';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Discover premium video content, educational courses, and connect with creators on TabooTV. Browse trending videos, explore series, and find your next favorite creator.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Home | TabooTV',
    description:
      'Discover premium video content, educational courses, and connect with creators on TabooTV.',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Home | TabooTV',
    description:
      'Discover premium video content, educational courses, and connect with creators on TabooTV.',
  },
};

export default async function HomePage() {
  const initialData = await fetchHomeData({ cursor: null, includeStatic: true });

  return <HomeContent initialData={initialData} />;
}
