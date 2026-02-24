import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRequest, unauthorizedResponse } from '@/lib/admin/route-guard';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const [contacts, reservations] = await Promise.all([
    db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    db.reservationRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ]);

  return NextResponse.json({ contacts, reservations });
}
