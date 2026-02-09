import { homeClient } from '@/api/client/home.client';
import { TOKEN_KEY, decodeCookieToken } from '@/shared/lib/auth/cookie-config';
import { seededShuffle, getDailySeed } from '@/shared/utils/array';
import type { Creator } from '@/types';
import { cookies } from 'next/headers';
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

  const filtered = creators.filter((c) => {
    const channelId = c.user?.channel?.id ?? c.id;
    return channelId !== 8;
  });

  return (
    <CreatorsSection
      initialCreators={seededShuffle(
        filtered.sort((a, b) => a.id - b.id),
        getDailySeed()
      )}
    />
  );
}
