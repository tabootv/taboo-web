import { cookies } from 'next/headers';
import { homeClient } from '@/api/client/home.client';
import { TOKEN_KEY, decodeCookieToken } from '@/shared/lib/auth/cookie-config';
import type { Banner } from '@/types';
import { BannerSlider } from '../_components/banner-slider';

export async function BannerSection() {
  const cookieStore = await cookies();
  const serverToken = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);

  let banners: Banner[];
  try {
    banners = await homeClient.getBanners(serverToken);
  } catch {
    banners = [];
  }

  return (
    <div className="relative w-full">
      <BannerSlider initialBanners={banners} />
    </div>
  );
}
