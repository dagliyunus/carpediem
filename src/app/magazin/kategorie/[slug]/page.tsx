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

type CategorySearchParams = {
  q?: string;
  seite?: string;
};

export const revalidate = 3600;

function createDescription(input?: string | null) {
  if (!input) {
    return 'Magazin-Kategorie des Carpe Diem Bad Saarow mit lokalen Restaurant- und Ausflugsthemen.';
  }

  return input.replace(/\s+/g, ' ').trim().slice(0, 180);
}

function buildCategoryHref(slug: string, input?: { page?: number; search?: string }) {
  const params = new URLSearchParams();

  if (input?.search) {
    params.set('q', input.search);
  }

  if (input?.page && input.page > 1) {
    params.set('seite', String(input.page));
  }

  const query = params.toString();
  return query ? `/magazin/kategorie/${slug}?${query}` : `/magazin/kategorie/${slug}`;
}

export async function generateStaticParams() {
  return [
    { slug: 'gerichte-zutaten' },
    { slug: 'events-live-musik' },
    { slug: 'news' },
    { slug: 'bad-saarow-tipps' },
  ];
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<CategorySearchParams>;
}): Promise<Metadata> {
  const [{ slug }, searchInput] = await Promise.all([params, searchParams]);
  const category = await getMagazinCategoryBySlug(slug);
  const search = searchInput.q?.trim() || '';
  const page = Math.max(1, Number(searchInput.seite || '1') || 1);

  if (!category) {
    return {
      title: 'Magazin',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = search
    ? `${category.name}: Suche nach ${search}`
    : `${category.name} | Magazin | Carpe Diem Bad Saarow`;
  const description = createDescription(category.introContent);
  const canonical = `${siteConfig.seo.domain}/magazin/kategorie/${category.slug}`;
  const shouldIndex = !search && page === 1;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: shouldIndex,
      follow: true,
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
  searchParams: Promise<CategorySearchParams>;
}) {
  const [{ slug }, queryInput] = await Promise.all([params, searchParams]);
  const search = queryInput.q?.trim() || '';
  const page = Math.max(1, Number(queryInput.seite || '1') || 1);
  const category = await getMagazinCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const posts = await getPaginatedMagazinPosts({
    categorySlug: category.slug,
    search,
    page,
  });

  if (page > 1 && posts.items.length === 0) {
    notFound();
  }

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

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
            <form action={`/magazin/kategorie/${category.slug}`} className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Suche in dieser Kategorie</span>
                <input
                  type="search"
                  name="q"
                  defaultValue={search}
                  placeholder={`z. B. ${category.name}`}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
                />
              </label>

              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  className="w-full rounded-full bg-primary-600 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
                >
                  Suchen
                </button>
                {search ? (
                  <Link
                    href={`/magazin/kategorie/${category.slug}`}
                    className="rounded-full border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white/90"
                  >
                    Reset
                  </Link>
                ) : null}
              </div>
            </form>
          </section>

          {search ? (
            <div className="rounded-[2rem] border border-primary-500/20 bg-primary-500/8 px-5 py-4 text-sm text-primary-100">
              {posts.total > 0
                ? `${posts.total} Beiträge gefunden in „${category.name}“ für „${search}“.`
                : `Keine Beiträge gefunden in „${category.name}“ für „${search}“.`}
            </div>
          ) : null}

          {!search && category.introIsEnabled ? (
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
                buildHref={(targetPage) =>
                  buildCategoryHref(category.slug, {
                    page: targetPage,
                    search,
                  })
                }
              />
            </div>
          ) : (
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur">
              <h2 className="font-blog text-2xl font-semibold text-white">Keine passenden Beiträge gefunden</h2>
              <p className="mt-3 text-accent-200">
                Nutzen Sie einen allgemeineren Suchbegriff oder wechseln Sie zurück zur kompletten Magazin-Übersicht.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
