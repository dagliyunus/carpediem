import { NextRequest, NextResponse } from 'next/server';
import { ensureArticleSeoDefaults } from '@/lib/cms/article-seo';
import { revalidatePublicMagazin } from '@/lib/cms/revalidation';
import { publishDueScheduledArticles } from '@/lib/cms/scheduler';

export const runtime = 'nodejs';

function isAuthorizedCronRequest(req: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }

  const authHeader = req.headers.get('authorization');
  return authHeader === `Bearer ${secret}`;
}

async function handleCron(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await publishDueScheduledArticles();

  if (result.publishedCount > 0) {
    await Promise.all(result.publishedIds.map((id) => ensureArticleSeoDefaults(id)));
    revalidatePublicMagazin();
  }

  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}
