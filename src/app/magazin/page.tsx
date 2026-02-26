import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { getPublishedMagazinPosts } from '@/lib/cms/queries';

export const metadata: Metadata = buildMetadata({
  title: 'Magazin',
  description:
    'Aktuelle Geschichten, Einblicke und News aus dem Carpe Diem bei Ben in Bad Saarow. Entdecken Sie unsere neuesten Inhalte.',
  path: '/magazin',
});

export default async function MagazinPage() {
  const posts = await getPublishedMagazinPosts();

  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-14">
          <header className="text-center space-y-5">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-400">Carpe Diem Journal</p>
            <h1 className="font-serif text-6xl md:text-8xl font-bold text-white tracking-tight">Magazin</h1>
            <p className="mx-auto max-w-3xl text-lg text-accent-200 font-light">
              Inspirierende Stories, saisonale Empfehlungen und Einblicke hinter die Kulissen unseres Hauses.
            </p>
          </header>

          {posts.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-accent-200">
              Aktuell sind noch keine Magazin-Beiträge veröffentlicht.
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur"
                >
                  <Link href={`/magazin/${post.slug}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden border-b border-white/10 bg-black/30">
                      {post.coverImage?.url ? (
                        <Image
                          src={post.coverImage.url}
                          alt={post.coverImage.altText || post.title}
                          fill
                          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                          className="object-cover transition-transform duration-700 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-accent-300">Kein Cover</div>
                      )}
                    </div>
                  </Link>
                  <div className="space-y-4 p-6">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-300">
                      <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('de-DE') : 'Entwurf'}</span>
                      <span>•</span>
                      <span>{post.readTimeMinutes || 1} Min.</span>
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-white leading-tight">
                      <Link href={`/magazin/${post.slug}`} className="hover:text-primary-300 transition-colors">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-sm text-accent-200 leading-relaxed line-clamp-4">{post.excerpt || 'Mehr lesen ...'}</p>
                    <Link
                      href={`/magazin/${post.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary-300"
                    >
                      Weiterlesen <span aria-hidden>→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
