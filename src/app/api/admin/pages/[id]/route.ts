import { ContentStatus, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest, unauthorizedResponse } from '@/lib/admin/route-guard';
import { db } from '@/lib/db';
import { recordAuditLog } from '@/lib/admin/audit';

const updateSchema = z.object({
  title: z.string().min(2).max(160),
  headline: z.string().max(220).optional(),
  subheadline: z.string().max(320).optional(),
  body: z.string().optional(),
  template: z.string().max(80).optional(),
  status: z.nativeEnum(ContentStatus),
  publishedAt: z.string().datetime().nullable().optional(),
  heroImageId: z.string().cuid().nullable().optional(),
  sections: z.unknown().optional(),
  mediaIds: z.array(z.string().cuid()).optional(),
});

function sanitizeJsonPayload(
  value: unknown
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;

  try {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  } catch {
    return undefined;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const { id } = await params;

  const page = await db.page.findUnique({
    where: { id },
    include: {
      heroImage: {
        select: { id: true, url: true, altText: true, filename: true },
      },
      mediaLinks: {
        include: {
          media: {
            select: { id: true, url: true, mediaType: true, filename: true, altText: true },
          },
        },
      },
    },
  });

  if (!page) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  return NextResponse.json({ item: page });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const { id } = await params;
  const payload = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid page payload.', details: parsed.error.issues }, { status: 400 });
  }

  try {
    const page = await db.$transaction(async (tx) => {
      const updated = await tx.page.update({
        where: { id },
        data: {
          title: parsed.data.title,
          headline: parsed.data.headline?.trim() || null,
          subheadline: parsed.data.subheadline?.trim() || null,
          body: parsed.data.body?.trim() || null,
          template: parsed.data.template?.trim() || 'standard',
          status: parsed.data.status,
          publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null,
          heroImageId: parsed.data.heroImageId || null,
          sections: sanitizeJsonPayload(parsed.data.sections),
        },
      });

      await tx.pageMediaLink.deleteMany({ where: { pageId: id } });

      const mediaIds = Array.from(new Set((parsed.data.mediaIds || []).filter(Boolean)));
      if (mediaIds.length > 0) {
        await tx.pageMediaLink.createMany({
          data: mediaIds.map((mediaId) => ({
            pageId: id,
            mediaId,
            fieldKey: 'content',
          })),
          skipDuplicates: true,
        });
      }

      return updated;
    });

    await recordAuditLog({
      actorId: admin.id,
      action: 'page.updated',
      entityType: 'Page',
      entityId: page.id,
      payload: { slug: page.slug },
    });

    return NextResponse.json({ item: page });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Page update failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const { id } = await params;

  const page = await db.page.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });

  if (!page) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  await db.page.delete({ where: { id } });

  await recordAuditLog({
    actorId: admin.id,
    action: 'page.deleted',
    entityType: 'Page',
    entityId: id,
    payload: { slug: page.slug },
  });

  return NextResponse.json({ ok: true });
}
