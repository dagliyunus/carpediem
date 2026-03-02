import bcrypt from 'bcryptjs';
import {
  AiChannel,
  ContentStatus,
  PrismaClient,
  SeoTargetType,
  SocialPlatform,
} from '@prisma/client';
import { MAGAZIN_CATEGORY_DEFINITIONS } from '../src/lib/cms/magazin';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@carpediem.local').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Carpe Diem Admin',
      passwordHash,
      isActive: true,
    },
    create: {
      email: adminEmail,
      name: 'Carpe Diem Admin',
      passwordHash,
      role: 'OWNER',
      isActive: true,
    },
  });

  await prisma.siteSetting.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      siteName: 'Carpe Diem bei Ben',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.carpediem-badsaarow.de',
      brandTagline: 'Mediterrane Küche in Bad Saarow',
      defaultLocale: 'de-DE',
      businessEmail: process.env.BUSINESS_EMAIL || 'viktoriia@carpediem-badsaarow.de',
      businessPhone: process.env.BUSINESS_PHONE || '0175 6729130',
      address: 'Am Kurpark 6, 15526 Bad Saarow',
      timezone: 'Europe/Berlin',
      defaultSeoTitle: 'Carpe Diem bei Ben - Mediterrane Küche in Bad Saarow',
      defaultSeoDescription:
        'Carpe Diem bei Ben ist Ihr Restaurant in Bad Saarow: mediterrane Spezialitäten, Galerie, Reservierung und Magazin.',
    },
  });

  const defaultPages = [
    {
      slug: 'home',
      title: 'Startseite',
      headline: null,
      subheadline: null,
      body: null,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    {
      slug: 'menu',
      title: 'Speisekarte',
      body: null,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    {
      slug: 'drinks',
      title: 'Getränke',
      body: null,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    {
      slug: 'galerie',
      title: 'Galerie',
      body: null,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    {
      slug: 'kontakt',
      title: 'Kontakt',
      body: null,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    {
      slug: 'reservieren',
      title: 'Reservierung',
      body: null,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    {
      slug: 'magazin',
      title: 'Magazin',
      body: null,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  ];

  for (const page of defaultPages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }

  for (const category of MAGAZIN_CATEGORY_DEFINITIONS) {
    await prisma.articleCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
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
    });
  }

  await prisma.seoMeta.upsert({
    where: {
      targetType_targetId: {
        targetType: SeoTargetType.GLOBAL,
        targetId: 'global',
      },
    },
    update: {},
    create: {
      targetType: SeoTargetType.GLOBAL,
      targetId: 'global',
      title: 'Carpe Diem bei Ben - Restaurant Bad Saarow',
      description:
        'Carpe Diem bei Ben in Bad Saarow: mediterrane Spezialitäten, Events, Reservierung und aktuelle Magazin-Inhalte.',
      keywords: 'carpe diem, bad saarow, restaurant, mediterran, magazin',
      canonicalUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.carpediem-badsaarow.de',
      twitterCard: 'summary_large_image',
      robots: 'index,follow',
      schemaType: 'Restaurant',
    },
  });

  const socialDefaults = [
    {
      id: 'social-instagram',
      platform: SocialPlatform.INSTAGRAM,
      url: 'https://instagram.com/carpediembadsaarow',
      handle: '@carpediembadsaarow',
      displayName: 'Instagram',
      sortOrder: 1,
    },
    {
      id: 'social-tiktok',
      platform: SocialPlatform.TIKTOK,
      url: 'https://tiktok.com/@carpediem_badsaarow',
      handle: '@carpediem_badsaarow',
      displayName: 'TikTok',
      sortOrder: 2,
    },
    {
      id: 'social-pinterest',
      platform: SocialPlatform.PINTEREST,
      url: 'https://pinterest.com/carpediembadsaarow',
      handle: '@carpediembadsaarow',
      displayName: 'Pinterest',
      sortOrder: 3,
    },
  ];

  for (const social of socialDefaults) {
    await prisma.socialAccount.upsert({
      where: { id: social.id },
      update: social,
      create: {
        ...social,
        siteSettingId: 'global',
        isActive: true,
      },
    });
  }

  const aiDefaults = [
    {
      channel: AiChannel.MAGAZIN,
      promptTemplate:
        'Erzeuge täglich einen SEO-optimierten Magazinbeitrag auf Deutsch inklusive Titel, Excerpt und Content mit lokalem Bezug zu Bad Saarow.',
    },
    {
      channel: AiChannel.INSTAGRAM,
      promptTemplate:
        'Erzeuge täglich einen Instagram-Post mit Hook, Caption, Hashtags und CTA im Tonfall von Carpe Diem bei Ben.',
    },
    {
      channel: AiChannel.PINTEREST,
      promptTemplate:
        'Erzeuge täglich einen Pinterest-Pin-Text mit SEO-Titel, Beschreibung und relevanten Keywords für Carpe Diem bei Ben.',
    },
    {
      channel: AiChannel.TIKTOK,
      promptTemplate:
        'Erzeuge täglich ein TikTok-Content-Briefing mit Skriptidee, Hook, Shotlist und Caption für Carpe Diem bei Ben.',
    },
  ];

  for (const agent of aiDefaults) {
    await prisma.aiAgentConfig.upsert({
      where: { channel: agent.channel },
      update: {},
      create: {
        channel: agent.channel,
        promptTemplate: agent.promptTemplate,
        isEnabled: false,
        siteSettingId: 'global',
        timezone: 'Europe/Berlin',
        runWindowStart: '08:00',
        runWindowEnd: '10:00',
        frequencyMins: 1440,
        targetLanguage: 'de',
      },
    });
  }

  console.log(`Seed finished. Admin login: ${admin.email}`);

  if (!process.env.ADMIN_PASSWORD) {
    console.warn('Warning: ADMIN_PASSWORD is not set. Seed used fallback password ChangeMe123!.');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
