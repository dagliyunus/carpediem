import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest, unauthorizedResponse } from '@/lib/admin/route-guard';
import { db } from '@/lib/db';
import { uploadMediaAsset } from '@/lib/cms/media';
import { recordAuditLog } from '@/lib/admin/audit';

export const runtime = 'nodejs';

const querySchema = z.object({
  q: z.string().optional(),
  type: z.enum(['IMAGE', 'VIDEO', 'FILE']).optional(),
});

export async function GET(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()));
  const q = parsed.success ? parsed.data.q?.trim() : undefined;
  const type = parsed.success ? parsed.data.type : undefined;

  const media = await db.mediaAsset.findMany({
    where: {
      ...(type ? { mediaType: type } : {}),
      ...(q
        ? {
            OR: [
              { filename: { contains: q, mode: 'insensitive' } },
              { title: { contains: q, mode: 'insensitive' } },
              { altText: { contains: q, mode: 'insensitive' } },
              { caption: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 200,
  });

  return NextResponse.json({ items: media });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminRequest(req);
  if (!admin) return unauthorizedResponse();

  const formData = await req.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required.' }, { status: 400 });
  }

  try {
    const media = await uploadMediaAsset({
      file,
      title: String(formData.get('title') || ''),
      altText: String(formData.get('altText') || ''),
      caption: String(formData.get('caption') || ''),
      uploadedById: admin.id,
    });

    await recordAuditLog({
      actorId: admin.id,
      action: 'media.uploaded',
      entityType: 'MediaAsset',
      entityId: media.id,
      payload: {
        filename: media.filename,
        mediaType: media.mediaType,
        sizeBytes: media.sizeBytes,
      },
    });

    return NextResponse.json({ item: media }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
