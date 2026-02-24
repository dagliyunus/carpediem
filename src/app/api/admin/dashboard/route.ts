import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRequest, unauthorizedResponse } from '@/lib/admin/route-guard';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const [articles, pages, media, contacts, reservations, recentLogs] = await Promise.all([
    db.article.count(),
    db.page.count(),
    db.mediaAsset.count(),
    db.contactMessage.count(),
    db.reservationRequest.count(),
    db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    stats: {
      articles,
      pages,
      media,
      contacts,
      reservations,
    },
    recentLogs,
  });
}
