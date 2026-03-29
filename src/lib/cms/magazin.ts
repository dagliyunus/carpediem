import { Prisma, type ArticleCategory } from '@prisma/client';
import { db } from '@/lib/db';
import {
  BAD_SAAROW_TIPPS_CATEGORY_NAME,
  BAD_SAAROW_TIPPS_CATEGORY_SLUG,
  LOCATION_FOCUS_SUGGESTIONS,
  MAGAZIN_CATEGORY_DEFINITIONS,
  MAGAZIN_POSTS_PER_PAGE,
  getDefaultMagazinCategory,
  getMagazinCategoryDefinitionByName,
  getMagazinCategoryDefinitionBySlug,
  inferMagazinCategory,
  isBadSaarowTippsCategory,
} from '@/lib/magazin/shared';

export {
  BAD_SAAROW_TIPPS_CATEGORY_NAME,
  BAD_SAAROW_TIPPS_CATEGORY_SLUG,
  LOCATION_FOCUS_SUGGESTIONS,
  MAGAZIN_CATEGORY_DEFINITIONS,
  MAGAZIN_POSTS_PER_PAGE,
  getDefaultMagazinCategory,
  getMagazinCategoryDefinitionByName,
  getMagazinCategoryDefinitionBySlug,
  inferMagazinCategory,
  isBadSaarowTippsCategory,
};

export async function ensureMagazinCategories(client: Prisma.TransactionClient | typeof db = db) {
  const results = await Promise.all(
    MAGAZIN_CATEGORY_DEFINITIONS.map((category) =>
      client.articleCategory.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          introHeadline: category.introHeadline,
          introContent: category.introContent,
          introPrimaryCtaLabel: category.introPrimaryCtaLabel,
          introPrimaryCtaHref: category.introPrimaryCtaHref,
          introSecondaryCtaLabel: category.introSecondaryCtaLabel,
          introSecondaryCtaHref: category.introSecondaryCtaHref,
          introIsEnabled: category.introIsEnabled,
        },
        create: {
          name: category.name,
          slug: category.slug,
          introHeadline: category.introHeadline,
          introContent: category.introContent,
          introPrimaryCtaLabel: category.introPrimaryCtaLabel,
          introPrimaryCtaHref: category.introPrimaryCtaHref,
          introSecondaryCtaLabel: category.introSecondaryCtaLabel,
          introSecondaryCtaHref: category.introSecondaryCtaHref,
          introIsEnabled: category.introIsEnabled,
        },
      })
    )
  );

  return results.sort(
    (a, b) =>
      MAGAZIN_CATEGORY_DEFINITIONS.findIndex((item) => item.slug === a.slug) -
      MAGAZIN_CATEGORY_DEFINITIONS.findIndex((item) => item.slug === b.slug)
  );
}

export function sortMagazinCategories<T extends Pick<ArticleCategory, 'slug'>>(items: T[]) {
  return [...items].sort(
    (a, b) =>
      MAGAZIN_CATEGORY_DEFINITIONS.findIndex((item) => item.slug === a.slug) -
      MAGAZIN_CATEGORY_DEFINITIONS.findIndex((item) => item.slug === b.slug)
  );
}
