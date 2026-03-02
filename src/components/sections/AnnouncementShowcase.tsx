import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getPublicMediaUrl } from '@/lib/cms/public-media';
import {
  getHomeAnnouncementFieldKey,
  normalizeHomePageSections,
} from '@/lib/cms/home-announcements';

type HomePageData = {
  sections: unknown;
  mediaLinks: Array<{
    fieldKey: string;
    media: {
      id: string;
      url: string;
      altText: string | null;
      filename: string;
      mediaType: string;
      width: number | null;
      height: number | null;
    };
  }>;
};

export function AnnouncementShowcase({ page }: { page: HomePageData | null }) {
  if (!page) return null;

  const homeSections = normalizeHomePageSections(page.sections);
  const mediaByFieldKey = new Map(page.mediaLinks.map((entry) => [entry.fieldKey, entry.media]));
  const activeItems = homeSections.announcementSection.items
    .filter((item) => item.isEnabled)
    .map((item) => ({
      ...item,
      media: mediaByFieldKey.get(getHomeAnnouncementFieldKey(item.id)) || null,
    }))
    .filter((item) => item.title.trim() || item.body.trim() || item.media);

  if (!homeSections.announcementSection.isEnabled || activeItems.length === 0) {
    return null;
  }

  const [featured, ...secondary] = activeItems;

  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-black py-14 md:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,133,58,0.16),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_32%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_28%,rgba(201,133,58,0.08),transparent_72%)] opacity-90" />

      <div className="container relative mx-auto space-y-10 px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-400/30 bg-primary-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-primary-300">
            <Sparkles className="h-4 w-4" />
            <span>{homeSections.announcementSection.eyebrow}</span>
          </div>
          <h2 className="mt-5 font-serif text-4xl font-bold tracking-tight text-white md:text-6xl">
            {homeSections.announcementSection.title}
          </h2>
          {homeSections.announcementSection.description ? (
            <p className="mt-4 text-base leading-relaxed text-accent-200 md:text-lg">
              {homeSections.announcementSection.description}
            </p>
          ) : null}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="overflow-hidden rounded-[2.7rem] border border-white/10 bg-white/[0.04] shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <div className={`grid h-full gap-0 ${featured.media ? 'lg:grid-cols-[1.05fr_0.95fr]' : ''}`}>
              {featured.media ? (
                <div className="relative min-h-[280px] overflow-hidden bg-black/40">
                  <Image
                    src={getPublicMediaUrl(featured.media.id, featured.media.url)}
                    alt={featured.altText || featured.media.altText || featured.title || featured.media.filename}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/50" />
                </div>
              ) : null}

              <div className="flex h-full flex-col justify-between space-y-6 p-7 md:p-10">
                <div className="space-y-5">
                  {featured.label ? (
                    <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-primary-300">
                      {featured.label}
                    </span>
                  ) : null}
                  <div className="space-y-3">
                    <h3 className="font-serif text-3xl font-bold leading-tight text-white md:text-5xl">
                      {featured.title}
                    </h3>
                    {featured.body ? (
                      <p className="max-w-2xl text-base leading-relaxed text-accent-200 md:text-lg">
                        {featured.body}
                      </p>
                    ) : null}
                  </div>
                </div>

                {featured.ctaLabel && featured.ctaHref ? (
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={featured.ctaHref}
                      className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-primary-700"
                    >
                      {featured.ctaLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </article>

          {secondary.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
              {secondary.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.03] shadow-[0_22px_50px_rgba(0,0,0,0.28)] backdrop-blur"
                >
                  {item.media ? (
                    <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-black/40">
                      <Image
                        src={getPublicMediaUrl(item.media.id, item.media.url)}
                        alt={item.altText || item.media.altText || item.title || item.media.filename}
                        fill
                        sizes="(max-width: 1280px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="space-y-4 p-6">
                    {item.label ? (
                      <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-primary-300">
                        {item.label}
                      </span>
                    ) : null}
                    <h3 className="font-serif text-2xl font-bold leading-tight text-white">{item.title}</h3>
                    {item.body ? <p className="text-sm leading-relaxed text-accent-200">{item.body}</p> : null}
                    {item.ctaLabel && item.ctaHref ? (
                      <Link
                        href={item.ctaHref}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary-300 transition-colors hover:text-primary-200"
                      >
                        {item.ctaLabel}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
