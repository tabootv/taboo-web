import { cookies } from 'next/headers';
import { homeClient } from '@/api/client/home.client';
import { TOKEN_KEY, decodeCookieToken } from '@/shared/lib/auth/cookie-config';
import type { Video } from '@/types';
import { HomeShortsSection } from '../_components/home-shorts';

export async function ShortsSectionServer() {
  const cookieStore = await cookies();
  const serverToken = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);

  let shorts: Video[];
  try {
    shorts = await homeClient.getShortVideos(serverToken);
  } catch {
    shorts = [];
  }

  return <HomeShortsSection initialShorts={shorts} />;
}
