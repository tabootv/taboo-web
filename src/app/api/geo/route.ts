import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/geo
 *
 * Returns the user's detected country code from platform-specific headers.
 * Supports Vercel, Cloudflare, and AWS CloudFront geo headers.
 * Returns null if no country can be detected (frontend falls back gracefully).
 */
export async function GET(request: NextRequest) {
  const country =
    // Vercel
    request.headers.get('x-vercel-ip-country') ||
    // Cloudflare
    request.headers.get('cf-ipcountry') ||
    // AWS CloudFront
    request.headers.get('cloudfront-viewer-country') ||
    null;

  return NextResponse.json(
    { country },
    {
      headers: {
        'Cache-Control': 'private, max-age=3600',
      },
    }
  );
}
