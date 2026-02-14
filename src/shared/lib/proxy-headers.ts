import { NextRequest } from 'next/server';

/**
 * Map of incoming Cloudflare/proxy headers → custom outgoing header names.
 * Custom names survive the second Cloudflare hop (api.taboo.tv),
 * which overwrites cf-* headers with the Vercel server's IP.
 */
const HEADER_MAP: Record<string, string> = {
  'cf-connecting-ip': 'X-Original-Client-IP',
  'cf-ipcountry': 'X-Original-Client-Country',
  'x-forwarded-for': 'X-Original-Forwarded-For',
  'x-real-ip': 'X-Original-Real-IP',
};

export function getProxyHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const [source, target] of Object.entries(HEADER_MAP)) {
    const value = request.headers.get(source);
    if (value) {
      headers[target] = value;
    }
  }
  return headers;
}
