import { cookies } from 'next/headers';
import { homeClient } from '@/api/client/home.client';
import { TOKEN_KEY, decodeCookieToken } from '@/shared/lib/auth/cookie-config';
import type { Creator } from '@/types';
import { CreatorsSection } from '../_components/creators';

export async function CreatorsSectionServer() {
  const cookieStore = await cookies();
  const serverToken = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);

  let creators: Creator[];
  try {
    creators = await homeClient.getCreators(serverToken);
  } catch {
    creators = [];
  }

  return <CreatorsSection initialCreators={creators} />;
}
