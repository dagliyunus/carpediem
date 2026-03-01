import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRequest, unauthorizedResponse } from '@/lib/admin/route-guard';
import { ensureMagazinCategories, MAGAZIN_CATEGORY_DEFINITIONS, sortMagazinCategories } from '@/lib/cms/magazin';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  await ensureMagazinCategories();

  const categories = await db.articleCategory.findMany({
    where: {
      slug: {
        in: MAGAZIN_CATEGORY_DEFINITIONS.map((item) => item.slug),
      },
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

  return NextResponse.json({ items: sortMagazinCategories(categories) });
}
