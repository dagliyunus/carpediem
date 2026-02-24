import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
        },
      },
    },
  });

  if (!alias?.media?.url) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const target = new URL(alias.media.url, req.nextUrl.origin);

  return NextResponse.redirect(target, {
    status: 307,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
