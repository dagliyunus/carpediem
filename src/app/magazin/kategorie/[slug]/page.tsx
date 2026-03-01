import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';
import { CategoryIntroBlock } from '@/components/magazin/CategoryIntroBlock';
import { MagazinPagination } from '@/components/magazin/Pagination';
import { MagazinPostCard } from '@/components/magazin/PostCard';
import { StructuredDataScript } from '@/components/seo/StructuredDataScript';
import { getMagazinCategoryBySlug, getPaginatedMagazinPosts } from '@/lib/cms/queries';
import { buildBreadcrumbSchema } from '@/lib/seo/magazin';

type Params = {
  slug: string;
};

export const dynamic = 'force-dynamic';

function createDescription(input?: string | null) {
  if (!input) {
    return 'Magazin-Kategorie des Carpe Diem Bad Saarow mit lokalen Restaurant- und Ausflugsthemen.';
  }

  return input.replace(/\s+/g, ' ').trim().slice(0, 180);
}

function buildCategoryHref(slug: string, page: number) {
  if (page <= 1) {
    return `/magazin/kategorie/${slug}`;
  }

  return `/magazin/kategorie/${slug}?seite=${page}`;
}

export async function generateStaticParams() {
  return [
    { slug: 'gerichte-zutaten' },
    { slug: 'events-live-musik' },
    { slug: 'news' },
    { slug: 'bad-saarow-tipps' },
  ];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getMagazinCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Magazin',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${category.name} | Magazin | Carpe Diem Bad Saarow`;
  const description = createDescription(category.introContent);
  const canonical = `${siteConfig.seo.domain}/magazin/kategorie/${category.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function MagazinCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ seite?: string }>;
}) {
  const { slug } = await params;
  const { seite } = await searchParams;
  const page = Math.max(1, Number(seite || '1') || 1);
  const category = await getMagazinCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const posts = await getPaginatedMagazinPosts({
    categorySlug: category.slug,
    page,
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Startseite', url: siteConfig.seo.domain },
    { name: 'Magazin', url: `${siteConfig.seo.domain}/magazin` },
    { name: category.name, url: `${siteConfig.seo.domain}/magazin/kategorie/${category.slug}` },
  ]);

  return (
    <div className="pb-24 pt-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-6xl space-y-10">
          <StructuredDataScript data={breadcrumbSchema} />

          <header className="space-y-4">
            <div className="font-blog flex flex-wrap items-center gap-2 text-sm font-medium text-accent-300">
              <Link href="/magazin" className="text-primary-300">
                Magazin
              </Link>
              <span>/</span>
              <span>{category.name}</span>
            </div>
            <h1 className="font-serif text-5xl font-bold tracking-tight text-white md:text-7xl">{category.name}</h1>
          </header>

          {category.introIsEnabled ? (
            <CategoryIntroBlock
              headline={category.introHeadline}
              content={category.introContent}
              media={category.introMedia}
              primaryLabel={category.introPrimaryCtaLabel}
              primaryHref={category.introPrimaryCtaHref}
              secondaryLabel={category.introSecondaryCtaLabel}
              secondaryHref={category.introSecondaryCtaHref}
            />
          ) : null}

          {posts.total > 0 ? (
            <div className="space-y-8">
              <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                {posts.items.map((post) => (
                  <MagazinPostCard key={post.id} post={post} />
                ))}
              </div>

              <MagazinPagination
                page={posts.page}
                pageCount={posts.pageCount}
                buildHref={(targetPage) => buildCategoryHref(category.slug, targetPage)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
