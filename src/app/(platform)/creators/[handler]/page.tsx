import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CreatorPageContent } from './CreatorPageContent';

interface PageProps {
  params: Promise<{ handler: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handler } = await params;

  return {
    title: `${handler}`,
    description: `Explore ${handler}'s raw, unfiltered content from around the world on Taboo TV.`,
    openGraph: {
      title: `${handler}`,
      description: `Explore ${handler}'s raw, unfiltered content from around the world on Taboo TV.`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${handler}`,
      description: `Explore ${handler}'s raw, unfiltered content from around the world on Taboo TV.`,
    },
  };
}

export default async function CreatorPage({ params }: PageProps) {
  const { handler } = await params;

  if (!handler) {
    notFound();
  }

  return <CreatorPageContent handler={handler} />;
}
