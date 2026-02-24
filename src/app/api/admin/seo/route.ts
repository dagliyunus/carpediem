import { Prisma, SeoTargetType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest, unauthorizedResponse } from '@/lib/admin/route-guard';
import { db } from '@/lib/db';
import { upsertSeoMeta } from '@/lib/cms/content';
import { recordAuditLog } from '@/lib/admin/audit';

const seoSchema = z.object({
  targetType: z.nativeEnum(SeoTargetType),
  targetId: z.string().min(1).max(180),
  title: z.string().max(180).optional(),
  description: z.string().max(500).optional(),
  keywords: z.string().max(300).optional(),
  canonicalUrl: z.string().url().optional(),
  robots: z.string().max(80).optional(),
  openGraphTitle: z.string().max(180).optional(),
  openGraphDescription: z.string().max(500).optional(),
  twitterCard: z.string().max(80).optional(),
  schemaType: z.string().max(100).optional(),
  ogImageId: z.string().cuid().nullable().optional(),
  extra: z.unknown().optional(),
});

export async function GET(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const targetType = req.nextUrl.searchParams.get('targetType') as SeoTargetType | null;
  const targetId = req.nextUrl.searchParams.get('targetId');

  if (targetType && targetId) {
    const item = await db.seoMeta.findUnique({
      where: {
        targetType_targetId: {
          targetType,
          targetId,
        },
      },
      include: {
        ogImage: {
          select: { id: true, url: true, altText: true, filename: true },
        },
      },
    });

    return NextResponse.json({ item });
  }

  const items = await db.seoMeta.findMany({
    include: {
      ogImage: {
        select: { id: true, url: true, altText: true, filename: true },
      },
    },
    orderBy: [{ targetType: 'asc' }, { targetId: 'asc' }],
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const payload = await req.json().catch(() => null);
  const parsed = seoSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid SEO payload.', details: parsed.error.issues }, { status: 400 });
  }

  try {
    const extra =
      parsed.data.extra === undefined
        ? undefined
        : (JSON.parse(JSON.stringify(parsed.data.extra)) as Prisma.JsonValue);

    const item = await upsertSeoMeta({
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      title: parsed.data.title,
      description: parsed.data.description,
      keywords: parsed.data.keywords,
      canonicalUrl: parsed.data.canonicalUrl,
      robots: parsed.data.robots,
      openGraphTitle: parsed.data.openGraphTitle,
      openGraphDescription: parsed.data.openGraphDescription,
      twitterCard: parsed.data.twitterCard,
      schemaType: parsed.data.schemaType,
      ogImageId: parsed.data.ogImageId,
      extra,
    });

    await recordAuditLog({
      actorId: admin.id,
      action: 'seo.upserted',
      entityType: 'SeoMeta',
      entityId: item.id,
      payload: {
        targetType: item.targetType,
        targetId: item.targetId,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SEO save failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
