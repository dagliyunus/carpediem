import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest, unauthorizedResponse } from '@/lib/admin/route-guard';
import { db } from '@/lib/db';
import { getOrCreateSiteSetting } from '@/lib/cms/content';
import { recordAuditLog } from '@/lib/admin/audit';

const settingsSchema = z.object({
  siteName: z.string().min(2).max(120),
  siteUrl: z.string().url(),
  brandTagline: z.string().max(180).optional(),
  defaultLocale: z.string().max(20).optional(),
  businessEmail: z.string().email().optional(),
  businessPhone: z.string().max(40).optional(),
  address: z.string().max(300).optional(),
  timezone: z.string().min(2).max(80).optional(),
  defaultSeoTitle: z.string().max(180).optional(),
  defaultSeoDescription: z.string().max(500).optional(),
  trackingGa4Id: z.string().max(64).optional(),
  trackingGtmId: z.string().max(64).optional(),
  trackingMetaPixelId: z.string().max(64).optional(),
  trackingGoogleAdsId: z.string().max(64).optional(),
});

export async function GET(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const item = await getOrCreateSiteSetting();
  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const payload = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid settings payload.', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const item = await db.siteSetting.upsert({
    where: { id: 'global' },
    update: {
      siteName: parsed.data.siteName,
      siteUrl: parsed.data.siteUrl,
      brandTagline: parsed.data.brandTagline?.trim() || null,
      defaultLocale: parsed.data.defaultLocale?.trim() || 'de-DE',
      businessEmail: parsed.data.businessEmail?.trim() || null,
      businessPhone: parsed.data.businessPhone?.trim() || null,
      address: parsed.data.address?.trim() || null,
      timezone: parsed.data.timezone?.trim() || 'Europe/Berlin',
      defaultSeoTitle: parsed.data.defaultSeoTitle?.trim() || null,
      defaultSeoDescription: parsed.data.defaultSeoDescription?.trim() || null,
      trackingGa4Id: parsed.data.trackingGa4Id?.trim() || null,
      trackingGtmId: parsed.data.trackingGtmId?.trim() || null,
      trackingMetaPixelId: parsed.data.trackingMetaPixelId?.trim() || null,
      trackingGoogleAdsId: parsed.data.trackingGoogleAdsId?.trim() || null,
    },
    create: {
      id: 'global',
      siteName: parsed.data.siteName,
      siteUrl: parsed.data.siteUrl,
      brandTagline: parsed.data.brandTagline?.trim() || null,
      defaultLocale: parsed.data.defaultLocale?.trim() || 'de-DE',
      businessEmail: parsed.data.businessEmail?.trim() || null,
      businessPhone: parsed.data.businessPhone?.trim() || null,
      address: parsed.data.address?.trim() || null,
      timezone: parsed.data.timezone?.trim() || 'Europe/Berlin',
      defaultSeoTitle: parsed.data.defaultSeoTitle?.trim() || null,
      defaultSeoDescription: parsed.data.defaultSeoDescription?.trim() || null,
      trackingGa4Id: parsed.data.trackingGa4Id?.trim() || null,
      trackingGtmId: parsed.data.trackingGtmId?.trim() || null,
      trackingMetaPixelId: parsed.data.trackingMetaPixelId?.trim() || null,
      trackingGoogleAdsId: parsed.data.trackingGoogleAdsId?.trim() || null,
    },
  });

  await recordAuditLog({
    actorId: admin.id,
    action: 'site-settings.updated',
    entityType: 'SiteSetting',
    entityId: item.id,
  });

  return NextResponse.json({ item });
}
