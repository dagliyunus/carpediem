import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRequest, unauthorizedResponse } from '@/lib/admin/route-guard';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

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
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
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
    return NextResponse.json({ error: 'Preview not available.' }, { status: upstream.status || 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'content-type': upstream.headers.get('content-type') || media.mimeType || 'application/octet-stream',
      'content-disposition': `inline; filename="${media.filename}"`,
      'cache-control': 'private, no-store',
    },
  });
}
