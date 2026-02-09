import { cookies } from 'next/headers';
import { playlistsClient } from '@/api/client/playlists.client';
import { TOKEN_KEY, decodeCookieToken } from '@/shared/lib/auth/cookie-config';
import type { Playlist } from '@/types';
import { PlaylistsInfiniteScroll } from '../playlists-infinite-scroll';

export async function PlaylistsSectionServer() {
  const cookieStore = await cookies();
  const serverToken = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);

  let playlists: Playlist[];
  let nextCursor: number | null = null;
  let isLastPage = true;

  try {
    const response = await playlistsClient.list({ page: 1, per_page: 3 }, serverToken);
    playlists = response.data || [];

    const currentPage = response.current_page ?? 1;
    const lastPage = response.last_page ?? 1;

    if (currentPage < lastPage) {
      nextCursor = currentPage + 1;
      isLastPage = false;
    }
  } catch {
    playlists = [];
  }

  return (
    <PlaylistsInfiniteScroll
      initialPlaylists={playlists}
      initialCursor={nextCursor}
      isInitialLastPage={isLastPage}
    />
  );
}
