import { cache } from 'react';
import { SeoTargetType } from '@prisma/client';
import { db } from '@/lib/db';
import { siteConfig } from '@/config/siteConfig';

export const getPublicSiteRuntime = cache(async () => {
  const [site, social, seo] = await Promise.all([
    db.siteSetting.findUnique({ where: { id: 'global' } }),
    db.socialAccount.findMany({
      where: {
        siteSettingId: 'global',
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    }),
    db.seoMeta.findUnique({
      where: {
        targetType_targetId: {
          targetType: SeoTargetType.GLOBAL,
          targetId: 'global',
        },
      },
      include: {
        ogImage: {
          select: {
            url: true,
            altText: true,
          },
        },
      },
    }),
  ]);

  const fallbackSocial = Object.entries(siteConfig.contact.socials).map(([platform, url], index) => ({
    id: `${platform}-${index}`,
    platform,
    url,
    handle: null,
    displayName: platform,
  }));

  return {
    site,
    seo,
    social: social.length > 0 ? social : fallbackSocial,
  };
});
