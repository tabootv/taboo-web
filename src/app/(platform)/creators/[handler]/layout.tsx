import { Metadata } from 'next';
import { creatorsClient } from '@/api/client/creators.client';
import { queryKeys } from '@/api/query-keys';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { CreatorLayoutClient } from './_components/CreatorLayoutClient';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ handler: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { handler } = await params;

  try {
    const response = await creatorsClient.listPublic({ handler });
    const creator = response.data?.[0];

    if (creator) {
      return {
        title: creator.name || handler,
        description:
          creator.description?.slice(0, 160) ||
          `Explore ${handler}'s raw, unfiltered content from around the world on Taboo TV.`,
        openGraph: {
          title: creator.name || handler,
          description:
            creator.description?.slice(0, 160) || `Explore ${handler}'s content on Taboo TV.`,
          type: 'website',
          ...(creator.dp ? { images: [{ url: creator.dp }] } : {}),
        },
        twitter: {
          card: 'summary',
          title: creator.name || handler,
          description:
            creator.description?.slice(0, 160) || `Explore ${handler}'s content on Taboo TV.`,
        },
      };
    }
  } catch {
    // Fall through to default metadata
  }

  return {
    title: handler,
    description: `Explore ${handler}'s raw, unfiltered content from around the world on Taboo TV.`,
  };
}

export default async function CreatorLayout({ children, params }: LayoutProps) {
  const { handler } = await params;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: [...queryKeys.creators.list({ handler }), 'by-handler'],
    queryFn: async () => {
      const response = await creatorsClient.listPublic({ handler });
      return { creators: response.data || response.creators || [] };
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CreatorLayoutClient handler={handler}>{children}</CreatorLayoutClient>
    </HydrationBoundary>
  );
}
