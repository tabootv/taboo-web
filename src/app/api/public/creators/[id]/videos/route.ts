import { NextRequest, NextResponse } from 'next/server';
import { getRequiredEnv } from '@/shared/lib/config/env';

// Force dynamic to avoid build-time env var requirement
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const sortBy = searchParams.get('sort_by') || 'newest';
  const API_URL = getRequiredEnv('NEXT_PUBLIC_API_URL');
  const SERVICE_TOKEN = getRequiredEnv('SERVICE_API_TOKEN');

  try {
    const response = await fetch(
      `${API_URL}/creators/creator-videos/${id}?sort_by=${sortBy}`,
      {
        headers: {
          'Accept': 'application/json',
          Authorization: `Bearer ${SERVICE_TOKEN}`,
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const videos = data.videos || data;

    return NextResponse.json(videos, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Failed to fetch videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
