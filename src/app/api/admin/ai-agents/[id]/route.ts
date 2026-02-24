import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest, unauthorizedResponse } from '@/lib/admin/route-guard';
import { db } from '@/lib/db';
import { recordAuditLog } from '@/lib/admin/audit';

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const updateSchema = z.object({
  isEnabled: z.boolean(),
  promptTemplate: z.string().min(10),
  contentTone: z.string().max(120).optional(),
  timezone: z.string().min(2).max(80),
  runWindowStart: z.string().regex(timePattern),
  runWindowEnd: z.string().regex(timePattern),
  frequencyMins: z.number().int().min(60).max(10080),
  targetLanguage: z.string().max(10),
  nextRunAt: z.string().datetime().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const payload = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid AI agent payload.', details: parsed.error.issues }, { status: 400 });
  }

  const { id } = await params;

  const item = await db.aiAgentConfig.update({
    where: { id },
    data: {
      isEnabled: parsed.data.isEnabled,
      promptTemplate: parsed.data.promptTemplate,
      contentTone: parsed.data.contentTone?.trim() || null,
      timezone: parsed.data.timezone,
      runWindowStart: parsed.data.runWindowStart,
      runWindowEnd: parsed.data.runWindowEnd,
      frequencyMins: parsed.data.frequencyMins,
      targetLanguage: parsed.data.targetLanguage,
      nextRunAt: parsed.data.nextRunAt ? new Date(parsed.data.nextRunAt) : null,
    },
  });

  await recordAuditLog({
    actorId: admin.id,
    action: 'ai-agent.updated',
    entityType: 'AiAgentConfig',
    entityId: item.id,
    payload: {
      channel: item.channel,
      isEnabled: item.isEnabled,
    },
  });

  return NextResponse.json({ item });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const { id } = await params;

  await db.aiAgentConfig.delete({ where: { id } });

  await recordAuditLog({
    actorId: admin.id,
    action: 'ai-agent.deleted',
    entityType: 'AiAgentConfig',
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
