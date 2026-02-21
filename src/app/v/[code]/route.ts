import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { TOKEN_KEY, decodeCookieToken, getApiUrl } from '@/shared/lib/auth/cookie-config';
import { decode, isUuid, isValidShortCode } from '@/shared/lib/short-url';

/**
 * Resolve the public-facing origin from proxy headers.
 *
 * Behind Cloudflare (or any reverse proxy), `request.url` reflects the
 * internal server address (e.g. `http://localhost:3002`). The proxy sets
 * `x-forwarded-host` / `x-forwarded-proto` to communicate the real origin.
 */
function getPublicOrigin(request: Request): string {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL || 'https://app.taboo.tv';
}

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
  const origin = getPublicOrigin(request);

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

  const studioUrl = new URL(`/studio/watch?v=${uuid}`, origin);

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
      ? new URL(`/shorts/${uuid}`, origin)
      : new URL(`/videos/${uuid}`, origin);

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
