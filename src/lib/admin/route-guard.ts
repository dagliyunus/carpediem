import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/admin/auth';
import { db } from '@/lib/db';

export async function requireAdminRequest(req: NextRequest) {
  const session = getAdminSessionFromRequest(req);

  if (!session) {
    return null;
  }

  const user = await db.adminUser.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return user;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
