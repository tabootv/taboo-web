import { cookies } from 'next/headers';
import { homeClient } from '@/api/client/home.client';
import { TOKEN_KEY, decodeCookieToken } from '@/shared/lib/auth/cookie-config';
import type { Video } from '@/types';
import { RecommendedSection } from '../_components/recommended';

export async function RecommendedSectionServer() {
  const cookieStore = await cookies();
  const serverToken = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);

  let videos: Video[];
  try {
    videos = await homeClient.getRecommendedVideos(serverToken);
  } catch {
    videos = [];
  }

  return <RecommendedSection initialVideos={videos} />;
}
