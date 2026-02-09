import { cookies } from 'next/headers';
import { homeClient } from '@/api/client/home.client';
import { TOKEN_KEY, decodeCookieToken } from '@/shared/lib/auth/cookie-config';
import type { Series } from '@/types';
import { HomeSeriesSection } from '../_components/home-series';

export async function SeriesSectionServer() {
  const cookieStore = await cookies();
  const serverToken = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);

  let series: Series[];
  try {
    series = await homeClient.getSeries(serverToken);
  } catch {
    series = [];
  }

  return <HomeSeriesSection initialSeries={series} />;
}
