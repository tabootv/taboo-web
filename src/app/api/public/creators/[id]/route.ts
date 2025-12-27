import { NextRequest, NextResponse } from 'next/server';

import { getRequiredEnv } from '@/shared/lib/config/env';

// Force dynamic to avoid build-time env var requirement
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const API_URL = getRequiredEnv('NEXT_PUBLIC_API_URL');
  const SERVICE_TOKEN = getRequiredEnv('SERVICE_API_TOKEN');

  try {
    // Fetch creator from Laravel API with service token
    const response = await fetch(`${API_URL}/creators/${id}`, {
      headers: {
        'Accept': 'application/json',
        Authorization: `Bearer ${SERVICE_TOKEN}`,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
      }
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const creator = data.creator || data.data || data;

    // Return with CORS headers for Framer
    return NextResponse.json(creator, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Failed to fetch creator:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creator' },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
