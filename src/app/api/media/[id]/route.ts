import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const media = await db.mediaAsset.findUnique({
    where: { id },
    select: {
      url: true,
      mimeType: true,
      filename: true,
    },
  });

  if (!media) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const headers: HeadersInit = {};
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    headers.Authorization = `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`;
  }

  const upstream = await fetch(media.url, {
    headers,
    cache: 'no-store',
  });

  if (!upstream.ok || !upstream.body) {
    return new NextResponse('Not Found', { status: upstream.status || 404 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'content-type': upstream.headers.get('content-type') || media.mimeType || 'application/octet-stream',
      'content-disposition': `inline; filename="${media.filename}"`,
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
}
