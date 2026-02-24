import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest, unauthorizedResponse } from '@/lib/admin/route-guard';
import { db } from '@/lib/db';
import { removeMediaAsset } from '@/lib/cms/media';
import { recordAuditLog } from '@/lib/admin/audit';

const patchSchema = z.object({
  title: z.string().max(120).optional(),
  altText: z.string().max(200).optional(),
  caption: z.string().max(500).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const { id } = await params;
  const payload = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const media = await db.mediaAsset.update({
    where: { id },
    data: {
      title: parsed.data.title?.trim() || null,
      altText: parsed.data.altText?.trim() || null,
      caption: parsed.data.caption?.trim() || null,
    },
  });

  await recordAuditLog({
    actorId: admin.id,
    action: 'media.updated',
    entityType: 'MediaAsset',
    entityId: media.id,
  });

  return NextResponse.json({ item: media });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const { id } = await params;

  try {
    await removeMediaAsset(id);

    await recordAuditLog({
      actorId: admin.id,
      action: 'media.deleted',
      entityType: 'MediaAsset',
      entityId: id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Deletion failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
