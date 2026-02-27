import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { getPublishedMagazinPosts } from '@/lib/cms/queries';
import { getPublicMediaUrl } from '@/lib/cms/public-media';

export const metadata: Metadata = buildMetadata({
  title: 'Magazin',
  description:
    'Aktuelle Geschichten, Einblicke und News aus dem Carpe Diem bei Ben in Bad Saarow. Entdecken Sie unsere neuesten Inhalte.',
  path: '/magazin',
});

function formatDate(date: string | Date | null) {
  if (!date) return 'Entwurf';
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default async function MagazinPage() {
  const posts = await getPublishedMagazinPosts();
  const featuredPost = posts[0] || null;
  const regularPosts = posts.slice(1);

  return (
    <div className="pb-24 pt-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-6xl space-y-14">
          <header className="space-y-5 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-400">Carpe Diem Journal</p>
            <h1 className="font-serif text-6xl font-bold tracking-tight text-white md:text-8xl">Magazin</h1>
            <p className="mx-auto max-w-3xl text-lg font-light text-accent-200">
              Inspirierende Stories, saisonale Empfehlungen und Einblicke hinter die Kulissen unseres Hauses.
            </p>
          </header>

          {posts.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-accent-200">
              Aktuell sind noch keine Magazin-Beitraege veroeffentlicht.
            </div>
          ) : (
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
                          {(featuredPost.categories || []).slice(0, 2).map((item) => (
                            <span
                              key={item.category.name}
                              className="rounded-full border border-primary-500/35 bg-primary-500/12 px-3 py-1 text-xs font-medium text-primary-100"
                            >
                              {item.category.name}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-primary-200/90">
                          <span>{formatDate(featuredPost.publishedAt)}</span>
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

              {regularPosts.length > 0 ? (
                <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                  {regularPosts.map((post) => (
                    <article
                      key={post.id}
                      className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-primary-400/40"
                    >
                      <Link href={`/magazin/${post.slug}`} className="block h-full">
                        <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-black/30">
                          {post.coverImage?.url ? (
                            <Image
                              src={getPublicMediaUrl(post.coverImage.id, post.coverImage.url)}
                              alt={post.coverImage.altText || post.title}
                              fill
                              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="font-blog flex h-full items-center justify-center text-accent-300">Kein Cover</div>
                          )}
                          {(post.categories || [])[0] ? (
                            <span className="font-blog absolute left-4 top-4 rounded-full border border-white/20 bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                              {post.categories[0].category.name}
                            </span>
                          ) : null}
                        </div>
                        <div className="font-blog space-y-4 p-6">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-primary-200/90">
                            <span>{formatDate(post.publishedAt)}</span>
                            <span>•</span>
                            <span>{post.readTimeMinutes || 1} Min.</span>
                          </div>
                          <h3 className="text-3xl font-semibold leading-tight text-white transition-colors group-hover:text-primary-200">
                            {post.title}
                          </h3>
                          <p className="line-clamp-3 text-[15px] leading-relaxed text-accent-200">
                            {post.excerpt || 'Mehr lesen ...'}
                          </p>
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-300">
                            Weiterlesen <span aria-hidden>→</span>
                          </span>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
