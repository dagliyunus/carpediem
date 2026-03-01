import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest, unauthorizedResponse } from '@/lib/admin/route-guard';
import { db } from '@/lib/db';
import { recordAuditLog } from '@/lib/admin/audit';

const patchSchema = z.object({
  introHeadline: z.string().max(220).nullable().optional(),
  introContent: z.string().nullable().optional(),
  introMediaId: z.string().cuid().nullable().optional(),
  introPrimaryCtaLabel: z.string().max(80).nullable().optional(),
  introPrimaryCtaHref: z.string().max(320).nullable().optional(),
  introSecondaryCtaLabel: z.string().max(80).nullable().optional(),
  introSecondaryCtaHref: z.string().max(320).nullable().optional(),
  introIsEnabled: z.boolean().optional(),
});

function validateCta(label?: string | null, href?: string | null) {
  if (label && !href) {
    throw new Error('CTA links require a target URL.');
  }

  if (href && !label) {
    throw new Error('CTA links require a label.');
  }
}

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
    return NextResponse.json({ error: 'Invalid category payload.', details: parsed.error.issues }, { status: 400 });
  }

  try {
    validateCta(parsed.data.introPrimaryCtaLabel || null, parsed.data.introPrimaryCtaHref || null);
    validateCta(parsed.data.introSecondaryCtaLabel || null, parsed.data.introSecondaryCtaHref || null);

    const category = await db.articleCategory.update({
      where: { id },
      data: {
        introHeadline: parsed.data.introHeadline?.trim() || null,
        introContent: parsed.data.introContent?.trim() || null,
        introMediaId: parsed.data.introMediaId || null,
        introPrimaryCtaLabel: parsed.data.introPrimaryCtaLabel?.trim() || null,
        introPrimaryCtaHref: parsed.data.introPrimaryCtaHref?.trim() || null,
        introSecondaryCtaLabel: parsed.data.introSecondaryCtaLabel?.trim() || null,
        introSecondaryCtaHref: parsed.data.introSecondaryCtaHref?.trim() || null,
        introIsEnabled: parsed.data.introIsEnabled ?? false,
      },
      include: {
        introMedia: {
          select: {
            id: true,
            url: true,
            filename: true,
            altText: true,
            mediaType: true,
          },
        },
      },
    });

    await recordAuditLog({
      actorId: admin.id,
      action: 'article-category.updated',
      entityType: 'ArticleCategory',
      entityId: category.id,
      payload: {
        slug: category.slug,
      },
    });

    return NextResponse.json({ item: category });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Category update failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
