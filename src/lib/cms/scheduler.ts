import { ContentStatus } from '@prisma/client';
import { db } from '@/lib/db';

export type ScheduledPublishResult = {
  checkedAt: string;
  dueCount: number;
  publishedCount: number;
  publishedIds: string[];
};

export async function publishDueScheduledArticles(now = new Date()): Promise<ScheduledPublishResult> {
  const dueArticles = await db.article.findMany({
    where: {
      status: ContentStatus.SCHEDULED,
      OR: [
        {
          scheduledAt: {
            lte: now,
          },
        },
        {
          AND: [
            {
              scheduledAt: null,
            },
            {
              publishedAt: {
                lte: now,
              },
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      publishedAt: true,
      scheduledAt: true,
    },
    orderBy: [{ scheduledAt: 'asc' }, { publishedAt: 'asc' }, { createdAt: 'asc' }],
    take: 200,
  });

  if (dueArticles.length === 0) {
    return {
      checkedAt: now.toISOString(),
      dueCount: 0,
      publishedCount: 0,
      publishedIds: [],
    };
  }

  await db.$transaction(
    dueArticles.map((article) =>
      db.article.update({
        where: { id: article.id },
        data: {
          status: ContentStatus.PUBLISHED,
          // Keep the original planned date if present for consistent sorting/display.
          publishedAt: article.publishedAt || article.scheduledAt || now,
          scheduledAt: null,
        },
      })
    )
  );

  return {
    checkedAt: now.toISOString(),
    dueCount: dueArticles.length,
    publishedCount: dueArticles.length,
    publishedIds: dueArticles.map((article) => article.id),
  };
}
