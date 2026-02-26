import { ContentStatus, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest, unauthorizedResponse } from '@/lib/admin/route-guard';
import { db } from '@/lib/db';
import { recordAuditLog } from '@/lib/admin/audit';
import { slugify } from '@/lib/cms/content';

const pageSchema = z.object({
  slug: z.string().max(120).optional(),
  title: z.string().min(2).max(160),
  headline: z.string().max(220).optional(),
  subheadline: z.string().max(320).optional(),
  body: z.string().optional(),
  template: z.string().max(80).optional(),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
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

export async function GET(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const pages = await db.page.findMany({
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
    orderBy: [{ slug: 'asc' }],
  });

  return NextResponse.json({ items: pages });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const payload = await req.json().catch(() => null);
  const parsed = pageSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid page payload.', details: parsed.error.issues }, { status: 400 });
  }

  const safeSlug = slugify(parsed.data.slug || parsed.data.title);
  if (!safeSlug) {
    return NextResponse.json({ error: 'Invalid slug.' }, { status: 400 });
  }

  try {
    const page = await db.$transaction(async (tx) => {
      const created = await tx.page.create({
        data: {
          slug: safeSlug,
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

      const mediaIds = Array.from(new Set((parsed.data.mediaIds || []).filter(Boolean)));
      if (mediaIds.length > 0) {
        await tx.pageMediaLink.createMany({
          data: mediaIds.map((mediaId) => ({
            pageId: created.id,
            mediaId,
            fieldKey: 'content',
          })),
          skipDuplicates: true,
        });
      }

      return created;
    });

    await recordAuditLog({
      actorId: admin.id,
      action: 'page.created',
      entityType: 'Page',
      entityId: page.id,
      payload: { slug: page.slug },
    });

    return NextResponse.json({ item: page }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Page creation failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
