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
  const hasSecondary = secondary.length > 0;
  const hasFeaturedText = Boolean(
    featured.label.trim() ||
      featured.title.trim() ||
      featured.body.trim() ||
      (featured.ctaLabel && featured.ctaHref)
  );
  const isImageOnlyFeatured = Boolean(featured.media) && !hasFeaturedText;
  const featuredAspectRatio =
    featured.media?.width && featured.media?.height
      ? `${featured.media.width} / ${featured.media.height}`
      : undefined;

  return (
    <section className="relative overflow-hidden bg-black py-14 md:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black via-black/90 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 [mask-image:radial-gradient(ellipse_at_top,black_28%,transparent_80%)] bg-[radial-gradient(ellipse_at_top,rgba(201,133,58,0.18),transparent_68%)] opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black via-black/90 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 [mask-image:radial-gradient(ellipse_at_bottom,black_28%,transparent_80%)] bg-[radial-gradient(ellipse_at_bottom,rgba(201,133,58,0.16),transparent_68%)] opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,133,58,0.10),transparent_46%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.03),transparent_38%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02),transparent_30%,rgba(201,133,58,0.04),transparent_74%)] opacity-85" />
      <div className="pointer-events-none absolute inset-x-[8%] top-8 h-14 bg-gradient-to-b from-black/65 to-transparent blur-xl" />
      <div className="pointer-events-none absolute inset-x-[8%] bottom-8 h-14 bg-gradient-to-t from-black/65 to-transparent blur-xl" />

      <div className="container relative mx-auto space-y-10 px-4 md:px-6">
        <div className="mx-auto max-w-4xl py-6 text-center">
          <div className="inline-flex items-center gap-2 border border-primary-400/40 bg-primary-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-primary-300">
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

        <div className={`grid gap-6 ${hasSecondary ? 'xl:grid-cols-[1.2fr_0.8fr]' : ''}`}>
          <article className="group relative overflow-hidden rounded-[1.9rem] border border-primary-500/25 bg-[#090909] shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-3 rounded-[1.45rem] border border-white/10" />
            <div className="pointer-events-none absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-primary-500/35 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-16 h-px bg-gradient-to-r from-transparent via-primary-500/25 to-transparent" />
            <div className={`grid h-full gap-0 ${featured.media && !isImageOnlyFeatured ? 'lg:grid-cols-[1.05fr_0.95fr]' : 'grid-cols-1'}`}>
              {featured.media ? (
                <div
                  className={`relative overflow-hidden bg-black/55 ${isImageOnlyFeatured ? 'min-h-[360px] sm:min-h-[480px] md:min-h-[620px]' : 'min-h-[300px] lg:min-h-[420px]'}`}
                  style={isImageOnlyFeatured && featuredAspectRatio ? { aspectRatio: featuredAspectRatio } : undefined}
                >
                  <Image
                    src={getPublicMediaUrl(featured.media.id, featured.media.url)}
                    alt={featured.altText || featured.media.altText || featured.title || featured.media.filename}
                    fill
                    sizes={isImageOnlyFeatured ? '100vw' : '(max-width: 1024px) 100vw, 50vw'}
                    className="object-contain object-center p-3 md:p-5"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/35" />
                  <div className="pointer-events-none absolute inset-0 m-5 border border-white/20" />
                </div>
              ) : null}

              {hasFeaturedText || !featured.media ? (
                <div className="relative flex h-full flex-col justify-between space-y-6 p-7 md:p-10">
                  <div className="pointer-events-none absolute inset-y-8 left-0 hidden w-px bg-gradient-to-b from-transparent via-primary-500/20 to-transparent lg:block" />
                  <div className="space-y-5">
                    {featured.label ? (
                      <span className="inline-flex self-start border border-primary-400/40 bg-primary-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-primary-300">
                        {featured.label}
                      </span>
                    ) : null}
                    <div className="space-y-3">
                      <h3 className="font-serif text-3xl font-bold leading-tight text-white md:text-[3.35rem]">
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
                        className="inline-flex items-center gap-2 border border-primary-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-primary-300 transition-colors hover:bg-primary-500/10 hover:text-primary-200"
                      >
                        {featured.ctaLabel}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </article>

          {secondary.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
              {secondary.map((item) => (
                <article
                  key={item.id}
                  className="group relative overflow-hidden rounded-[1.7rem] border border-primary-500/20 bg-[#090909] shadow-[0_22px_50px_rgba(0,0,0,0.28)] backdrop-blur"
                >
                  <div className="pointer-events-none absolute inset-3 rounded-[1.2rem] border border-white/10" />
                  {item.media ? (
                    <div
                      className="relative overflow-hidden border-b border-primary-500/20 bg-black/55"
                      style={
                        item.media?.width && item.media?.height
                          ? { aspectRatio: `${item.media.width} / ${item.media.height}` }
                          : { aspectRatio: '16 / 10' }
                      }
                    >
                      <Image
                        src={getPublicMediaUrl(item.media.id, item.media.url)}
                        alt={item.altText || item.media.altText || item.title || item.media.filename}
                        fill
                        sizes="(max-width: 1280px) 100vw, 33vw"
                        className="object-contain object-center p-3 md:p-4"
                      />
                      <div className="pointer-events-none absolute inset-0 m-4 border border-white/15" />
                    </div>
                  ) : null}
                  <div className="space-y-4 p-6">
                    {item.label ? (
                      <span className="inline-flex border border-primary-400/35 bg-primary-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-primary-300">
                        {item.label}
                      </span>
                    ) : null}
                    <h3 className="font-serif text-2xl font-bold leading-tight text-white">{item.title}</h3>
                    {item.body ? <p className="text-sm leading-relaxed text-accent-200">{item.body}</p> : null}
                    {item.ctaLabel && item.ctaHref ? (
                      <Link
                        href={item.ctaHref}
                        className="inline-flex items-center gap-2 border border-primary-500/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary-300 transition-colors hover:bg-primary-500/10 hover:text-primary-200"
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
