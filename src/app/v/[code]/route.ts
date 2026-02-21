import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { TOKEN_KEY, decodeCookieToken, getApiUrl } from '@/shared/lib/auth/cookie-config';
import { decode, isUuid, isValidShortCode } from '@/shared/lib/short-url';

/**
 * Smart Video Redirect — GET /v/:code
 *
 * Accepts either a legacy UUID or a base62-encoded short code.
 * Makes an authenticated API call to determine the correct redirect:
 *   - Published + not hidden short → /shorts/{uuid}
 *   - Published + not hidden video → /videos/{uuid}
 *   - Everything else             → /studio/watch?v={uuid}
 */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  // Resolve the UUID from either a raw UUID or a base62 short code
  let uuid: string;

  if (isUuid(code)) {
    uuid = code;
  } else if (isValidShortCode(code)) {
    try {
      uuid = decode(code);
    } catch {
      return NextResponse.json({ error: 'Invalid short code' }, { status: 404 });
    }
  } else {
    return NextResponse.json({ error: 'Invalid code' }, { status: 404 });
  }

  const studioUrl = new URL(`/studio/watch?v=${uuid}`, request.url);

  // Read auth token from cookie
  const cookieStore = await cookies();
  const token = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);

  if (!token) {
    return NextResponse.redirect(studioUrl, { status: 307 });
  }

  // Authenticated: ask the API where to send the user
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/videos/${uuid}/play`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      return redirect307(studioUrl);
    }

    const data = await res.json();
    const video = data?.data ?? data;

    const isShort = video?.short === true || video?.is_short === true || video?.type === 'short';

    const destination = isShort
      ? new URL(`/shorts/${uuid}`, request.url)
      : new URL(`/videos/${uuid}`, request.url);

    return redirect307(destination);
  } catch {
    // Timeout or network error — fall back to studio
    return redirect307(studioUrl);
  }
}

function redirect307(url: URL): NextResponse {
  return NextResponse.redirect(url, {
    status: 307,
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}
