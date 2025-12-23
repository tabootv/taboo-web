import { NextRequest, NextResponse } from 'next/server';

// Public API endpoint for creator profiles (no auth required)
// Framer landing pages can call this

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://app.taboo.tv/api';

// Use a service token for server-to-server calls
// This token should have read-only access to public creator data
const SERVICE_TOKEN = process.env.SERVICE_API_TOKEN || '';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Fetch creator from Laravel API with service token
    const response = await fetch(`${API_URL}/creators/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': SERVICE_TOKEN ? `Bearer ${SERVICE_TOKEN}` : '',
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
