import { SocialPlatform } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest, unauthorizedResponse } from '@/lib/admin/route-guard';
import { db } from '@/lib/db';
import { recordAuditLog } from '@/lib/admin/audit';

const createSchema = z.object({
  platform: z.nativeEnum(SocialPlatform),
  displayName: z.string().max(80).optional(),
  handle: z.string().max(120).optional(),
  url: z.string().url(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export async function GET(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const items = await db.socialAccount.findMany({
    where: { siteSettingId: 'global' },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const payload = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid social payload.', details: parsed.error.issues }, { status: 400 });
  }

  const item = await db.socialAccount.create({
    data: {
      siteSettingId: 'global',
      platform: parsed.data.platform,
      displayName: parsed.data.displayName?.trim() || null,
      handle: parsed.data.handle?.trim() || null,
      url: parsed.data.url,
      isActive: parsed.data.isActive ?? true,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });

  await recordAuditLog({
    actorId: admin.id,
    action: 'social.created',
    entityType: 'SocialAccount',
    entityId: item.id,
    payload: { platform: item.platform, url: item.url },
  });

  return NextResponse.json({ item }, { status: 201 });
}
