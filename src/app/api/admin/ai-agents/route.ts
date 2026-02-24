import { AiChannel } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest, unauthorizedResponse } from '@/lib/admin/route-guard';
import { db } from '@/lib/db';
import { recordAuditLog } from '@/lib/admin/audit';

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const upsertSchema = z.object({
  channel: z.nativeEnum(AiChannel),
  isEnabled: z.boolean().optional(),
  promptTemplate: z.string().min(10),
  contentTone: z.string().max(120).optional(),
  timezone: z.string().min(2).max(80).optional(),
  runWindowStart: z.string().regex(timePattern),
  runWindowEnd: z.string().regex(timePattern),
  frequencyMins: z.number().int().min(60).max(10080).optional(),
  targetLanguage: z.string().max(10).optional(),
  nextRunAt: z.string().datetime().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const items = await db.aiAgentConfig.findMany({
    where: { siteSettingId: 'global' },
    orderBy: { channel: 'asc' },
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const payload = await req.json().catch(() => null);
  const parsed = upsertSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid AI agent payload.', details: parsed.error.issues }, { status: 400 });
  }

  const item = await db.aiAgentConfig.upsert({
    where: {
      channel: parsed.data.channel,
    },
    update: {
      isEnabled: parsed.data.isEnabled ?? false,
      promptTemplate: parsed.data.promptTemplate,
      contentTone: parsed.data.contentTone?.trim() || null,
      timezone: parsed.data.timezone?.trim() || 'Europe/Berlin',
      runWindowStart: parsed.data.runWindowStart,
      runWindowEnd: parsed.data.runWindowEnd,
      frequencyMins: parsed.data.frequencyMins ?? 1440,
      targetLanguage: parsed.data.targetLanguage || 'de',
      nextRunAt: parsed.data.nextRunAt ? new Date(parsed.data.nextRunAt) : null,
    },
    create: {
      siteSettingId: 'global',
      channel: parsed.data.channel,
      isEnabled: parsed.data.isEnabled ?? false,
      promptTemplate: parsed.data.promptTemplate,
      contentTone: parsed.data.contentTone?.trim() || null,
      timezone: parsed.data.timezone?.trim() || 'Europe/Berlin',
      runWindowStart: parsed.data.runWindowStart,
      runWindowEnd: parsed.data.runWindowEnd,
      frequencyMins: parsed.data.frequencyMins ?? 1440,
      targetLanguage: parsed.data.targetLanguage || 'de',
      nextRunAt: parsed.data.nextRunAt ? new Date(parsed.data.nextRunAt) : null,
    },
  });

  await recordAuditLog({
    actorId: admin.id,
    action: 'ai-agent.upserted',
    entityType: 'AiAgentConfig',
    entityId: item.id,
    payload: {
      channel: item.channel,
      isEnabled: item.isEnabled,
      runWindowStart: item.runWindowStart,
      runWindowEnd: item.runWindowEnd,
    },
  });

  return NextResponse.json({ item });
}
