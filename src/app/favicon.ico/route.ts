import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

function isPrivateBlobUrl(url: string) {
  return url.includes('.private.blob.vercel-storage.com');
}

async function resolveFaviconTarget() {
  const alias = await db.assetAlias.findFirst({
    where: {
      aliasPath: {
        in: ['/favicon.ico', '/images/icons/favicon-logo.png'],
      },
    },
    include: {
      media: {
        select: {
          url: true,
          key: true,
        },
      },
    },
    orderBy: {
      aliasPath: 'asc',
    },
  });

  return alias?.media ?? null;
}

export async function GET(req: NextRequest) {
  const media = await resolveFaviconTarget();

  if (!media?.url) {
    return new NextResponse('Not Found', { status: 404 });
  }

  if (isPrivateBlobUrl(media.url)) {
    const result = await get(media.key, {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!result || !result.stream) {
      return new NextResponse('Not Found', { status: 404 });
    }

    return new NextResponse(result.stream, {
      status: 200,
      headers: {
        'Content-Type': result.blob.contentType || 'image/x-icon',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  return NextResponse.redirect(new URL(media.url, req.nextUrl.origin), {
    status: 307,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
