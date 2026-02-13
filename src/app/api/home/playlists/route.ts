import { fetchHomeData } from '@/shared/lib/api/home-data';
import { NextRequest, NextResponse } from 'next/server';
import { createApiLogger } from '@/shared/lib/logger';

const log = createApiLogger('/api/home/playlists', 'GET');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cursorParam = searchParams.get('cursor');
    const cursor = cursorParam ? Number.parseInt(cursorParam, 10) : null;

    const result = await fetchHomeData({
      cursor,
      includeStatic: false,
    });

    return NextResponse.json(result);
  } catch (error) {
    log.error({ err: error }, 'Error fetching playlists via API route');
    return NextResponse.json(
      {
        playlists: [],
        nextCursor: null,
        isLastPage: true,
        static: null,
      },
      { status: 500 }
    );
  }
}
