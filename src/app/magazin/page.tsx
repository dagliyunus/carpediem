import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { getMagazinCategories, getPaginatedMagazinPosts } from '@/lib/cms/queries';
import { getPublicMediaUrl } from '@/lib/cms/public-media';
import { CategoryIntroBlock } from '@/components/magazin/CategoryIntroBlock';
import { MagazinPostCard } from '@/components/magazin/PostCard';
import { MagazinPagination } from '@/components/magazin/Pagination';
import { MAGAZIN_CATEGORY_DEFINITIONS } from '@/lib/magazin/shared';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
  title: 'Magazin Bad Saarow',
  description:
    'Magazin des Carpe Diem Bad Saarow mit lokalen Restaurant- und Ausflugsthemen: Gerichte, Events, News und Bad Saarow Tipps.',
  path: '/magazin',
});

function buildMagazinHref(input: { page?: number; search?: string; categorySlug?: string }) {
  const params = new URLSearchParams();

  if (input.search) {
    params.set('q', input.search);
  }

  if (input.categorySlug) {
    params.set('kategorie', input.categorySlug);
  }

  if (input.page && input.page > 1) {
    params.set('seite', String(input.page));
  }

  const query = params.toString();
  return query ? `/magazin?${query}` : '/magazin';
}

export default async function MagazinPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategorie?: string; seite?: string }>;
}) {
  const params = await searchParams;
  const search = params.q?.trim() || '';
  const requestedCategorySlug = params.kategorie?.trim() || '';
  const page = Math.max(1, Number(params.seite || '1') || 1);
  const defaultCategorySlug = MAGAZIN_CATEGORY_DEFINITIONS[0].slug;
  const categorySlug = requestedCategorySlug || (!search ? defaultCategorySlug : '');

  const [categories, posts] = await Promise.all([
    getMagazinCategories(),
    getPaginatedMagazinPosts({
      search,
      categorySlug,
      page,
    }),
  ]);

  const activeCategory = categories.find((category) => category.slug === categorySlug) || null;
  const isDefaultListing = !search && !categorySlug && page === 1;
  const featuredPost = isDefaultListing ? posts.items[0] || null : null;
  const regularPosts = featuredPost ? posts.items.slice(1) : posts.items;

  return (
    <div className="pb-24 pt-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-6xl space-y-12">
          <header className="space-y-5 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-400">Carpe Diem Journal</p>
            <h1 className="font-serif text-6xl font-bold tracking-tight text-white md:text-8xl">Magazin</h1>
            <p className="mx-auto max-w-3xl text-lg font-light text-accent-200">
              Lokale Geschichten, Restaurant-News, Eventtipps und Bad Saarow Inspirationen für Menschen mit Genuss- und Ausflugsabsicht.
            </p>
          </header>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
            <form action="/magazin" className="grid gap-4 lg:grid-cols-[1fr_260px_auto]">
              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Suche</span>
                <input
                  type="search"
                  name="q"
                  defaultValue={search}
                  placeholder="z. B. Bad Saarow, Therme, Fisch, Live-Musik"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-[0.16em] text-accent-300">Kategorie</span>
                <select
                  name="kategorie"
                  defaultValue={categorySlug}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
                >
                  <option value="">Alle Kategorien</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  className="w-full rounded-full bg-primary-600 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
                >
                  Filtern
                </button>
                {(search || categorySlug) ? (
                  <Link
                    href="/magazin"
                    className="rounded-full border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white/90"
                  >
                    Reset
                  </Link>
                ) : null}
              </div>
            </form>

            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={buildMagazinHref({
                    categorySlug: category.slug === categorySlug ? undefined : category.slug,
                    search,
                  })}
                  className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${
                    category.slug === categorySlug
                      ? 'border-primary-400/50 bg-primary-500/15 text-primary-100'
                      : 'border-white/15 text-white/85 hover:border-primary-400/40'
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </section>

          {activeCategory?.introIsEnabled ? (
            <CategoryIntroBlock
              headline={activeCategory.introHeadline}
              content={activeCategory.introContent}
              media={activeCategory.introMedia}
              primaryLabel={activeCategory.introPrimaryCtaLabel}
              primaryHref={activeCategory.introPrimaryCtaHref}
              secondaryLabel={activeCategory.introSecondaryCtaLabel}
              secondaryHref={activeCategory.introSecondaryCtaHref}
            />
          ) : null}

          {posts.total > 0 ? (
            <div className="space-y-8">
              {featuredPost ? (
                <article className="group overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur">
                  <Link href={`/magazin/${featuredPost.slug}`} className="grid lg:grid-cols-[1.1fr_1fr]">
                    <div className="relative min-h-[320px] overflow-hidden border-b border-white/10 bg-black/40 lg:border-b-0 lg:border-r">
                      {featuredPost.coverImage?.url ? (
                        <>
                          <Image
                            src={getPublicMediaUrl(featuredPost.coverImage.id, featuredPost.coverImage.url)}
                            alt={featuredPost.coverImage.altText || featuredPost.title}
                            fill
                            sizes="(min-width: 1024px) 50vw, 100vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        </>
                      ) : (
                        <div className="font-blog flex h-full items-center justify-center text-base text-accent-300">Kein Cover</div>
                      )}
                    </div>
                    <div className="font-blog flex flex-col justify-between space-y-5 bg-gradient-to-br from-white/[0.04] to-transparent p-7 md:p-9">
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {(featuredPost.categories || []).slice(0, 1).map((item) => (
                            <Link
                              key={item.category.slug}
                              href={`/magazin/kategorie/${item.category.slug}`}
                              className="rounded-full border border-primary-500/35 bg-primary-500/12 px-3 py-1 text-xs font-medium text-primary-100"
                            >
                              {item.category.name}
                            </Link>
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-primary-200/90">
                          <span>
                            {featuredPost.publishedAt
                              ? new Date(featuredPost.publishedAt).toLocaleDateString('de-DE')
                              : 'Entwurf'}
                          </span>
                          <span>•</span>
                          <span>{featuredPost.readTimeMinutes || 1} Min.</span>
                        </div>
                        <h2 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                          {featuredPost.title}
                        </h2>
                        <p className="text-base leading-relaxed text-accent-200">
                          {featuredPost.excerpt || 'Mehr lesen ...'}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-300 transition-colors group-hover:text-primary-200">
                        Weiterlesen <span aria-hidden>→</span>
                      </span>
                    </div>
                  </Link>
                </article>
              ) : null}

              <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                {regularPosts.map((post) => (
                  <MagazinPostCard key={post.id} post={post} />
                ))}
              </div>

              <MagazinPagination
                page={posts.page}
                pageCount={posts.pageCount}
                buildHref={(targetPage) =>
                  buildMagazinHref({
                    page: targetPage,
                    search,
                    categorySlug,
                  })
                }
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
