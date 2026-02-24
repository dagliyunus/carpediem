import { ContentStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest, unauthorizedResponse } from '@/lib/admin/route-guard';
import { db } from '@/lib/db';
import { recordAuditLog } from '@/lib/admin/audit';
import { upsertArticle } from '@/lib/cms/content';

const updateSchema = z.object({
  title: z.string().min(2).max(160),
  slug: z.string().max(180).optional(),
  excerpt: z.string().max(320).optional(),
  content: z.string().min(20),
  status: z.nativeEnum(ContentStatus),
  publishedAt: z.string().datetime().nullable().optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  coverImageId: z.string().cuid().nullable().optional(),
  mediaIds: z.array(z.string().cuid()).optional(),
  categoryNames: z.array(z.string().min(1).max(80)).optional(),
  tagNames: z.array(z.string().min(1).max(80)).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const { id } = await params;

  const article = await db.article.findUnique({
    where: { id },
    include: {
      coverImage: true,
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      mediaLinks: true,
      author: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!article) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  return NextResponse.json({ item: article });
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
    return NextResponse.json({ error: 'Invalid article payload.', details: parsed.error.issues }, { status: 400 });
  }

  try {
    const article = await upsertArticle({
      id,
      ...parsed.data,
      authorId: admin.id,
    });

    await recordAuditLog({
      actorId: admin.id,
      action: 'article.updated',
      entityType: 'Article',
      entityId: article.id,
      payload: {
        slug: article.slug,
        status: article.status,
      },
    });

    return NextResponse.json({ item: article });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Article update failed.';
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

  const article = await db.article.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });

  if (!article) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  await db.article.delete({ where: { id } });

  await recordAuditLog({
    actorId: admin.id,
    action: 'article.deleted',
    entityType: 'Article',
    entityId: id,
    payload: { slug: article.slug },
  });

  return NextResponse.json({ ok: true });
}
