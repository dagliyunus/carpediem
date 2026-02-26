import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ContentStatus, SeoTargetType } from '@prisma/client';
import { db } from '@/lib/db';
import { getMagazinPostBySlug } from '@/lib/cms/queries';
import { siteConfig } from '@/config/siteConfig';

type Params = {
  slug: string;
};

function createExcerpt(content: string, fallback?: string | null) {
  if (fallback) return fallback;
  const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return plain.slice(0, 180);
}

export async function generateStaticParams() {
  const posts = await db.article.findMany({
    where: {
      status: ContentStatus.PUBLISHED,
      publishedAt: {
        lte: new Date(),
      },
    },
    select: {
      slug: true,
    },
    take: 200,
  });

  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.article.findUnique({
    where: { slug },
    include: {
      coverImage: {
        select: { url: true, altText: true },
      },
    },
  });

  if (!post) {
    return {
      title: 'Magazin',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const seo = await db.seoMeta.findUnique({
    where: {
      targetType_targetId: {
        targetType: SeoTargetType.ARTICLE,
        targetId: post.id,
      },
    },
    include: {
      ogImage: {
        select: { url: true, altText: true },
      },
    },
  });

  const title = seo?.title || post.title;
  const description =
    seo?.description ||
    createExcerpt(post.content, post.excerpt) ||
    'Aktueller Magazinbeitrag aus dem Carpe Diem bei Ben.';
  const canonical = seo?.canonicalUrl || `${siteConfig.seo.domain}/magazin/${post.slug}`;
  const ogImage = seo?.ogImage?.url || post.coverImage?.url || `${siteConfig.seo.domain}/images/outside_night.webp`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'article',
      title: seo?.openGraphTitle || title,
      description: seo?.openGraphDescription || description,
      url: canonical,
      images: [
        {
          url: ogImage,
          alt: seo?.ogImage?.altText || post.coverImage?.altText || post.title,
        },
      ],
    },
    twitter: {
      card: (seo?.twitterCard as 'summary' | 'summary_large_image' | 'player' | 'app' | undefined) ||
        'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function MagazinDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getMagazinPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const isPublished = post.status === ContentStatus.PUBLISHED;

  if (!isPublished) {
    notFound();
  }

  const paragraphs = post.content
    .split(/\n{2,}/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  const formattedDate = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('de-DE') : '-';

  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-5xl space-y-10">
          <Link
            href="/magazin"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-300"
          >
            <span aria-hidden>←</span> Zurueck zum Magazin
          </Link>

          {post.coverImage?.url ? (
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10">
              <div className="relative aspect-[16/9]">
                <Image
                  src={post.coverImage.url}
                  alt={post.coverImage.altText || post.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/5" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                  <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-primary-200">
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <span>{post.readTimeMinutes || 1} Min. Lesezeit</span>
                    {post.author ? (
                      <>
                        <span>•</span>
                        <span>{post.author.name}</span>
                      </>
                    ) : null}
                  </div>
                  <h1 className="font-serif text-4xl font-bold leading-[0.95] text-white md:text-6xl">{post.title}</h1>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h1 className="font-serif text-5xl font-bold leading-[0.95] text-white md:text-7xl">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-accent-300">
                <span>{formattedDate}</span>
                <span>•</span>
                <span>{post.readTimeMinutes || 1} Min. Lesezeit</span>
                {post.author ? (
                  <>
                    <span>•</span>
                    <span>{post.author.name}</span>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {post.excerpt ? <p className="text-xl text-accent-200 leading-relaxed italic">{post.excerpt}</p> : null}

          <article className="space-y-6 text-accent-100 leading-8 text-lg">
            {paragraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>
            ))}
          </article>

          <div className="flex flex-wrap gap-2 pt-4">
            {post.categories.map((category) => (
              <span
                key={category.id}
                className="rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary-200"
              >
                {category.category.name}
              </span>
            ))}
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-white/80"
              >
                #{tag.tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
