import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

function isPrivateBlobUrl(url: string) {
  return url.includes('.private.blob.vercel-storage.com');
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ asset: string[] }> }
) {
  const { asset } = await params;
  const aliasPath = `/images/${asset.join('/')}`;

  const alias = await db.assetAlias.findUnique({
    where: { aliasPath },
    include: {
      media: {
        select: {
          url: true,
          key: true,
        },
      },
    },
  });

  if (!alias?.media?.url) {
    return new NextResponse('Not Found', { status: 404 });
  }

  if (isPrivateBlobUrl(alias.media.url)) {
    const result = await get(alias.media.key, {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!result || !result.stream) {
      return new NextResponse('Not Found', { status: 404 });
    }

    return new NextResponse(result.stream, {
      status: 200,
      headers: {
        'Content-Type': result.blob.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  const target = new URL(alias.media.url, req.nextUrl.origin);

  return NextResponse.redirect(target, {
    status: 307,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
