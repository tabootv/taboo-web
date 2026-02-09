import { cookies } from 'next/headers';
import { homeClient } from '@/api/client/home.client';
import { TOKEN_KEY, decodeCookieToken } from '@/shared/lib/auth/cookie-config';
import type { Video } from '@/types';
import { FeaturedSection } from '../_components/featured';

export async function FeaturedSectionServer() {
  const cookieStore = await cookies();
  const serverToken = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);

  let videos: Video[];
  try {
    videos = await homeClient.getFeaturedVideos(serverToken);
  } catch {
    videos = [];
  }

  return <FeaturedSection initialVideos={videos} />;
}
