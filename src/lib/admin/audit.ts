import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';

export async function recordAuditLog(input: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  payload?: Prisma.JsonValue;
}) {
  await db.auditLog.create({
    data: {
      actorId: input.actorId || null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId || null,
      payload: input.payload ?? Prisma.JsonNull,
    },
  });
}
