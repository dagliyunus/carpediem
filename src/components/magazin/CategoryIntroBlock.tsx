import Image from 'next/image';
import Link from 'next/link';
import { MediaType } from '@prisma/client';
import { getPublicMediaUrl } from '@/lib/cms/public-media';
import { MagazinRichText } from '@/components/magazin/RichText';

type IntroMedia = {
  id: string;
  url: string;
  altText: string | null;
  filename: string;
  mediaType: MediaType;
};

type CategoryIntroBlockProps = {
  headline?: string | null;
  content?: string | null;
  media?: IntroMedia | null;
  primaryLabel?: string | null;
  primaryHref?: string | null;
  secondaryLabel?: string | null;
  secondaryHref?: string | null;
};

export function CategoryIntroBlock({
  headline,
  content,
  media,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CategoryIntroBlockProps) {
  if (!headline && !content && !media && !primaryLabel && !secondaryLabel) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur">
      <div className={`grid gap-0 ${media ? 'lg:grid-cols-[1.1fr_0.9fr]' : ''}`}>
        <div className="space-y-6 p-7 md:p-9">
          {headline ? <h2 className="font-blog text-4xl font-semibold leading-tight text-white md:text-5xl">{headline}</h2> : null}
          {content ? <MagazinRichText content={content} className="font-blog space-y-5 text-[1.02rem]" /> : null}
          {primaryLabel || secondaryLabel ? (
            <div className="flex flex-wrap gap-3 pt-2">
              {primaryLabel && primaryHref ? (
                <Link
                  href={primaryHref}
                  className="rounded-full bg-primary-600 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
                >
                  {primaryLabel}
                </Link>
              ) : null}
              {secondaryLabel && secondaryHref ? (
                <Link
                  href={secondaryHref}
                  className="rounded-full border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white/90"
                >
                  {secondaryLabel}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        {media ? (
          <div className="relative min-h-[280px] border-t border-white/10 bg-black/30 lg:border-l lg:border-t-0">
            {media.mediaType === MediaType.VIDEO ? (
              <video
                src={getPublicMediaUrl(media.id, media.url)}
                controls
                preload="metadata"
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={getPublicMediaUrl(media.id, media.url)}
                alt={media.altText || headline || media.filename}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
