import { ContentStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest, unauthorizedResponse } from '@/lib/admin/route-guard';
import { db } from '@/lib/db';
import { recordAuditLog } from '@/lib/admin/audit';
import { upsertArticle } from '@/lib/cms/content';

const createSchema = z.object({
  title: z.string().min(2).max(160),
  slug: z.string().max(180).optional(),
  excerpt: z.string().max(320).optional(),
  content: z.string().min(20),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
  publishedAt: z.string().datetime().nullable().optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  coverImageId: z.string().cuid().nullable().optional(),
  mediaIds: z.array(z.string().cuid()).optional(),
  categoryNames: z.array(z.string().min(1).max(80)).optional(),
  tagNames: z.array(z.string().min(1).max(80)).optional(),
});

export async function GET(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const statusParam = req.nextUrl.searchParams.get('status');

  const articles = await db.article.findMany({
    where:
      statusParam && Object.values(ContentStatus).includes(statusParam as ContentStatus)
        ? { status: statusParam as ContentStatus }
        : undefined,
    include: {
      coverImage: {
        select: {
          id: true,
          url: true,
          altText: true,
          filename: true,
        },
      },
      categories: {
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
      tags: {
        include: {
          tag: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
      mediaLinks: {
        select: {
          mediaId: true,
          fieldKey: true,
        },
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: 200,
  });

  return NextResponse.json({ items: articles });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const payload = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid article payload.', details: parsed.error.issues }, { status: 400 });
  }

  try {
    const article = await upsertArticle({
      ...parsed.data,
      authorId: admin.id,
    });

    await recordAuditLog({
      actorId: admin.id,
      action: 'article.created',
      entityType: 'Article',
      entityId: article.id,
      payload: {
        slug: article.slug,
        status: article.status,
      },
    });

    return NextResponse.json({ item: article }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Article creation failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
