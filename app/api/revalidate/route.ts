import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route to revalidate cache on-demand
 * Called by the server when config is updated
 *
 * Usage: GET /api/revalidate?secret=YOUR_SECRET&tag=robots-catalog
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const tag = searchParams.get('tag');

  // Validate secret
  const expectedSecret = process.env.REVALIDATE_SECRET;
  if (!expectedSecret) {
    console.error('REVALIDATE_SECRET environment variable not configured');
    return NextResponse.json(
      { error: 'Server misconfigured' },
      { status: 500 },
    );
  }

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  // Validate tag
  if (!tag) {
    return NextResponse.json(
      { error: 'Missing tag parameter' },
      { status: 400 },
    );
  }

  // Allowed tags for revalidation
  const allowedTags = ['robots-catalog'];
  if (!allowedTags.includes(tag)) {
    return NextResponse.json({ error: 'Invalid tag' }, { status: 400 });
  }

  try {
    revalidateTag(tag);
    console.log(`Cache revalidated for tag: ${tag}`);
    return NextResponse.json({
      revalidated: true,
      tag,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Error revalidating cache for tag ${tag}:`, error);
    return NextResponse.json(
      { error: 'Failed to revalidate cache' },
      { status: 500 },
    );
  }
}
