/**
 * Catch-All API Proxy Route
 *
 * Proxies all /api/* requests to the backend, reading the auth token
 * from the HttpOnly cookie and adding it as an Authorization header.
 *
 * This ensures XSS protection - JavaScript cannot access the token,
 * but authenticated requests still work through this server-side proxy.
 *
 * Note: More specific routes like /api/auth/* take precedence over this catch-all.
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { TOKEN_KEY, decodeCookieToken, getApiUrl } from '@/shared/lib/auth/cookie-config';
import { createApiLogger } from '@/shared/lib/logger';

async function proxyRequest(request: NextRequest, method: string) {
  const log = createApiLogger(request.nextUrl.pathname, method);
  try {
    const cookieStore = await cookies();
    const token = decodeCookieToken(cookieStore.get(TOKEN_KEY)?.value);
    const apiUrl = getApiUrl();

    // Get the path from the URL (everything after /api/)
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api/, '');
    const queryString = url.search;

    // Build headers
    const headers: HeadersInit = {
      Accept: 'application/json',
    };

    // Add Authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Determine content type and body
    let body: BodyInit | null = null;
    const contentType = request.headers.get('content-type');

    if (method !== 'GET' && method !== 'HEAD') {
      if (contentType?.includes('multipart/form-data')) {
        // For file uploads, pass through the FormData
        body = await request.formData();
      } else if (contentType?.includes('application/json')) {
        headers['Content-Type'] = 'application/json';
        body = await request.text();
      } else if (contentType) {
        headers['Content-Type'] = contentType;
        body = await request.text();
      }
    }

    // Forward the request to the backend
    const backendUrl = `${apiUrl}${path}${queryString}`;
    const response = await fetch(backendUrl, {
      method,
      headers,
      ...(body !== null && { body }),
    });

    // Get response data
    const responseContentType = response.headers.get('content-type');
    let data;

    if (responseContentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Return the response
    let res: NextResponse;
    if (typeof data === 'string') {
      res = new NextResponse(data, {
        status: response.status,
        headers: {
          'Content-Type': responseContentType || 'text/plain',
        },
      });
    } else {
      res = NextResponse.json(data, { status: response.status });
    }

    // NOTE: Do NOT delete auth cookie on 401 here. Cookie cleanup is handled
    // exclusively by /api/me/route.ts after verifying the token is truly invalid.
    // Deleting here causes cascade failures where one 401 wipes the cookie,
    // making all subsequent requests also fail with 401.

    return res;
  } catch (error) {
    log.error({ err: error }, 'API proxy error');
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, 'DELETE');
}
