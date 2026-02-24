import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
        },
      },
    },
    orderBy: {
      aliasPath: 'asc',
    },
  });

  return alias?.media?.url ?? null;
}

export async function GET(req: NextRequest) {
  const target = await resolveFaviconTarget();

  if (!target) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return NextResponse.redirect(new URL(target, req.nextUrl.origin), {
    status: 307,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
