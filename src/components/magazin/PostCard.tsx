import Image from 'next/image';
import Link from 'next/link';
import { getPublicMediaUrl } from '@/lib/cms/public-media';

type PostCardProps = {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    publishedAt: Date | null;
    readTimeMinutes: number | null;
    coverImage?: {
      id: string;
      url: string;
      altText: string | null;
    } | null;
    categories: Array<{
      category: {
        name: string;
        slug: string;
      };
    }>;
  };
};

function formatDate(date: Date | null) {
  if (!date) return 'Entwurf';
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function MagazinPostCard({ post }: PostCardProps) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-primary-400/40">
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
          {post.categories[0] ? (
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
  );
}
