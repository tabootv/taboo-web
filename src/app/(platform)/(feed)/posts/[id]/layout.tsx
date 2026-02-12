import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { postsClient } from '@/api/client/posts.client';
import { queryKeys } from '@/api/query-keys';
import { TOKEN_KEY, decodeCookieToken } from '@/shared/lib/auth/cookie-config';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import type { Post } from '@/types';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) {
    return { title: 'Post not found' };
  }

  try {
    const cookieStore = await cookies();
    const serverToken = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);
    const post = await postsClient.get(postId, serverToken);
    const captionText = post.caption?.replace(/<[^>]*>/g, '').slice(0, 160) || 'Community Post';
    const creatorName = post.channel?.name || post.user?.display_name || 'TabooTV';
    const ogImage = post.media?.[0]?.original_url || post.post_image?.[0];

    return {
      title: `${creatorName} - Post`,
      description: captionText,
      openGraph: {
        title: `${creatorName} on TabooTV`,
        description: captionText,
        type: 'article',
        ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      },
      twitter: {
        card: ogImage ? 'summary_large_image' : 'summary',
        title: `${creatorName} on TabooTV`,
        description: captionText,
      },
    };
  } catch {
    return { title: 'Post not found' };
  }
}

export default async function PostDetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) notFound();

  const cookieStore = await cookies();
  const serverToken = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.community.postDetail(postId),
    queryFn: () => postsClient.get(postId, serverToken),
    staleTime: 1000 * 60 * 5,
  });

  const post = queryClient.getQueryData<Post>(queryKeys.community.postDetail(postId));
  if (!post) notFound();

  await queryClient.prefetchQuery({
    queryKey: [...queryKeys.community.comments(postId), 1],
    queryFn: () => postsClient.getComments(postId, { page: 1 }, serverToken),
    staleTime: 1000 * 60 * 5,
  });

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
