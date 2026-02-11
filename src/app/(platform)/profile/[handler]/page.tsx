import { usersClient } from '@/api/client/users.client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicProfileClient } from './_components/PublicProfileClient';

interface PageProps {
  params: Promise<{ handler: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handler } = await params;

  try {
    const user = await usersClient.getUserByHandler(handler);
    const name = user.display_name || handler;
    return {
      title: `${name} (@${handler}) | Taboo TV`,
      description: `View ${name}'s profile on Taboo TV.`,
      openGraph: {
        title: `${name} (@${handler}) | Taboo TV`,
        description: `View ${name}'s profile on Taboo TV.`,
        type: 'profile',
        ...(user.avatar ? { images: [{ url: user.avatar }] } : {}),
      },
    };
  } catch {
    return {
      title: `@${handler} | Taboo TV`,
      description: `User profile on Taboo TV.`,
    };
  }
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { handler } = await params;

  const user = await usersClient.getUserByHandler(handler).catch(() => null);

  if (!user) notFound();

  return (
    <PublicProfileClient
      handler={handler}
      displayName={user.display_name}
      avatar={user.avatar}
      isCreator={user.is_creator}
    />
  );
}
