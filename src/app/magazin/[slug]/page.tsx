import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ContentStatus } from '@prisma/client';
import { getMagazinPostBySlug, getPublishedMagazinPostSlugs, getRelatedMagazinPosts } from '@/lib/cms/queries';
import { siteConfig } from '@/config/siteConfig';
import { getPublicMediaUrl } from '@/lib/cms/public-media';
import { StructuredDataScript } from '@/components/seo/StructuredDataScript';
import { buildArticleSchema, buildBreadcrumbSchema, buildEventSchema, buildMagazinPostSeo, getPrimaryCategory } from '@/lib/seo/magazin';
import { extractMagazinHeadings, MagazinRichText } from '@/components/magazin/RichText';
import { MagazinPostCard } from '@/components/magazin/PostCard';

type Params = {
  slug: string;
};

export const revalidate = 3600;

function parseDate(input?: Date | string | null) {
  if (!input) return null;

  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatPublishedDate(date?: Date | string | null) {
  const parsedDate = parseDate(date);

  if (!parsedDate) return 'Entwurf';

  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'long',
    timeZone: 'Europe/Berlin',
  }).format(parsedDate);
}

export async function generateStaticParams() {
  const posts = await getPublishedMagazinPostSlugs();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getMagazinPostBySlug(slug);

  if (!post || post.status !== ContentStatus.PUBLISHED) {
    return {
      title: 'Magazin',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const seo = buildMagazinPostSeo(post);
  const publishedDateTime = parseDate(post.publishedAt)?.toISOString();
  const modifiedDateTime = parseDate(post.updatedAt)?.toISOString();

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: seo.canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'article',
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: seo.canonical,
      publishedTime: publishedDateTime,
      modifiedTime: modifiedDateTime,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: [
        {
          url: seo.ogImage,
          alt: seo.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    },
  };
}

export default async function MagazinDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getMagazinPostBySlug(slug);

  if (!post || post.status !== ContentStatus.PUBLISHED) {
    notFound();
  }

  const primaryCategory = getPrimaryCategory(post);
  const headings = extractMagazinHeadings(post.content);
  const relatedPosts = await getRelatedMagazinPosts({
    articleId: post.id,
    categorySlug: primaryCategory?.slug,
    take: 3,
  });
  const publishedDate = formatPublishedDate(post.publishedAt);
  const galleryMedia = post.mediaLinks.filter((item) => item.fieldKey === 'gallery');
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Startseite', url: siteConfig.seo.domain },
    { name: 'Magazin', url: `${siteConfig.seo.domain}/magazin` },
    ...(primaryCategory
      ? [
          {
            name: primaryCategory.name,
            url: `${siteConfig.seo.domain}/magazin/kategorie/${primaryCategory.slug}`,
          },
        ]
      : []),
    { name: post.title, url: `${siteConfig.seo.domain}/magazin/${post.slug}` },
  ]);
  const articleSchema = buildArticleSchema(post);
  const eventSchema = buildEventSchema(post);
  const publishedDateTime = parseDate(post.publishedAt)?.toISOString();

  return (
    <div className="pb-24 pt-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-6xl space-y-10">
          <StructuredDataScript data={breadcrumbSchema} />
          <StructuredDataScript data={articleSchema} />
          {eventSchema ? <StructuredDataScript data={eventSchema} /> : null}

          <Link href="/magazin" className="font-blog inline-flex items-center gap-2 text-sm font-medium text-primary-300">
            <span aria-hidden>←</span> Zurück zum Magazin
          </Link>

          {post.coverImage?.url ? (
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10">
              <div className="relative aspect-[16/9]">
                <Image
                  src={getPublicMediaUrl(post.coverImage.id, post.coverImage.url)}
                  alt={post.coverImage.altText || post.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/5" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                  <div className="font-blog mb-4 flex flex-wrap items-center gap-3 text-sm font-medium text-primary-200">
                    {primaryCategory ? (
                      <Link href={`/magazin/kategorie/${primaryCategory.slug}`} className="text-primary-200">
                        {primaryCategory.name}
                      </Link>
                    ) : null}
                    <span>•</span>
                    <time dateTime={publishedDateTime} aria-label={`Veröffentlicht am ${publishedDate}`}>
                      Veröffentlicht am {publishedDate}
                    </time>
                    <span>•</span>
                    <span>{post.readTimeMinutes || 1} Min. Lesezeit</span>
                    {post.author ? (
                      <>
                        <span>•</span>
                        <span>{post.author.name}</span>
                      </>
                    ) : null}
                  </div>
                  <h1 className="font-blog text-4xl font-semibold leading-[1.02] text-white md:text-6xl">{post.title}</h1>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="font-blog flex flex-wrap items-center gap-3 text-sm font-medium text-accent-300">
                {primaryCategory ? (
                  <Link href={`/magazin/kategorie/${primaryCategory.slug}`} className="text-primary-300">
                    {primaryCategory.name}
                  </Link>
                ) : null}
                <span>•</span>
                <time dateTime={publishedDateTime} aria-label={`Veröffentlicht am ${publishedDate}`}>
                  Veröffentlicht am {publishedDate}
                </time>
                <span>•</span>
                <span>{post.readTimeMinutes || 1} Min. Lesezeit</span>
                {post.author ? (
                  <>
                    <span>•</span>
                    <span>{post.author.name}</span>
                  </>
                ) : null}
              </div>
              <h1 className="font-blog text-5xl font-semibold leading-[1.02] text-white md:text-7xl">{post.title}</h1>
            </div>
          )}

          {post.excerpt ? <p className="font-blog max-w-3xl text-xl leading-relaxed text-accent-200">{post.excerpt}</p> : null}

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
            <article className="font-blog space-y-8">
              {galleryMedia.length > 0 ? (
                <section className="grid gap-4 md:grid-cols-2">
                  {galleryMedia.map((item) => (
                    <div key={`${item.mediaId}-${item.fieldKey}`} className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/25">
                      <div className="relative aspect-[16/11]">
                        {item.media.mediaType === 'VIDEO' ? (
                          <video
                            src={getPublicMediaUrl(item.media.id, item.media.url)}
                            controls
                            preload="metadata"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Image
                            src={getPublicMediaUrl(item.media.id, item.media.url)}
                            alt={item.media.altText || item.media.filename}
                            fill
                            sizes="(min-width: 768px) 50vw, 100vw"
                            className="object-cover"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </section>
              ) : null}

              <MagazinRichText content={post.content} className="max-w-4xl space-y-6 text-[1.06rem]" />

              <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-400">Besuchen Sie uns in Bad Saarow</p>
                  <h2 className="font-blog text-3xl font-semibold text-white">Reservierung oder direkte Anfrage</h2>
                  <p className="font-blog max-w-3xl text-accent-200">
                    Verbinden Sie Ihren Aufenthalt in Bad Saarow mit mediterraner Küche im Carpe Diem. Reservieren Sie direkt oder schreiben Sie uns für Rückfragen.
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/reservieren"
                    className="rounded-full bg-primary-600 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
                  >
                    Jetzt reservieren
                  </Link>
                  <Link
                    href="/kontakt"
                    className="rounded-full border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white/90"
                  >
                    Kontakt
                  </Link>
                </div>
              </section>

              <div className="flex flex-wrap gap-2 pt-2">
                {post.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/magazin/kategorie/${category.category.slug}`}
                    className="font-blog rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-200"
                  >
                    {category.category.name}
                  </Link>
                ))}
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="font-blog rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80"
                  >
                    #{tag.tag.name}
                  </span>
                ))}
              </div>
            </article>

            <aside className="space-y-5">
              {headings.length >= 3 ? (
                <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
                  <h2 className="font-blog text-lg font-semibold text-white">Inhaltsverzeichnis</h2>
                  <nav className="mt-4 space-y-3">
                    {headings.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block text-sm text-accent-200 hover:text-primary-200 ${
                          heading.level > 1 ? 'pl-4' : ''
                        }`}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </section>
              ) : null}

              <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
                <h2 className="font-blog text-lg font-semibold text-white">Kurzlinks</h2>
                <div className="mt-4 space-y-3">
                  <Link
                    href="/reservieren"
                    className="block rounded-full bg-primary-600 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-white"
                  >
                    Reservieren
                  </Link>
                  <Link
                    href="/kontakt"
                    className="block rounded-full border border-white/15 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-white/90"
                  >
                    Kontakt
                  </Link>
                </div>
              </section>
            </aside>
          </div>

          {relatedPosts.length > 0 ? (
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-blog text-3xl font-semibold text-white">Mehr aus dieser Kategorie</h2>
                {primaryCategory ? (
                  <Link
                    href={`/magazin/kategorie/${primaryCategory.slug}`}
                    className="text-sm font-medium text-primary-300"
                  >
                    Alle Beiträge ansehen
                  </Link>
                ) : null}
              </div>
              <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <MagazinPostCard key={relatedPost.id} post={relatedPost} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
