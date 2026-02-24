import { SocialPlatform } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest, unauthorizedResponse } from '@/lib/admin/route-guard';
import { db } from '@/lib/db';
import { recordAuditLog } from '@/lib/admin/audit';

const updateSchema = z.object({
  platform: z.nativeEnum(SocialPlatform),
  displayName: z.string().max(80).optional(),
  handle: z.string().max(120).optional(),
  url: z.string().url(),
  isActive: z.boolean(),
  sortOrder: z.number().int().min(0).max(999),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const payload = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid social payload.', details: parsed.error.issues }, { status: 400 });
  }

  const { id } = await params;

  const item = await db.socialAccount.update({
    where: { id },
    data: {
      platform: parsed.data.platform,
      displayName: parsed.data.displayName?.trim() || null,
      handle: parsed.data.handle?.trim() || null,
      url: parsed.data.url,
      isActive: parsed.data.isActive,
      sortOrder: parsed.data.sortOrder,
    },
  });

  await recordAuditLog({
    actorId: admin.id,
    action: 'social.updated',
    entityType: 'SocialAccount',
    entityId: item.id,
    payload: { platform: item.platform, url: item.url },
  });

  return NextResponse.json({ item });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const { id } = await params;

  await db.socialAccount.delete({ where: { id } });

  await recordAuditLog({
    actorId: admin.id,
    action: 'social.deleted',
    entityType: 'SocialAccount',
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
