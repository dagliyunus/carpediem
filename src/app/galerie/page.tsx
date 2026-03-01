import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { BreadcrumbTrail } from '@/components/seo/BreadcrumbTrail';
import { StructuredDataScript } from '@/components/seo/StructuredDataScript';
import { buildBreadcrumbSchema } from '@/lib/seo/breadcrumbs';
import { siteConfig } from '@/config/siteConfig';
import { getPageContent } from '@/lib/cms/queries';
import {
  DEFAULT_GALLERY_PAGE_BODY,
  DEFAULT_GALLERY_PAGE_HEADLINE,
  DEFAULT_GALLERY_PAGE_SECTIONS,
  DEFAULT_GALLERY_PAGE_SUBHEADLINE,
  normalizeGalleryPageSections,
} from '@/lib/cms/gallery-page';
import { getPublicMediaUrl } from '@/lib/cms/public-media';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Restaurant Galerie Bad Saarow',
  description:
    'Galerie vom Carpe Diem bei Ben in Bad Saarow mit Eindruecken zu Ambiente, mediterranen Gerichten und Event-Abenden am Kurpark.',
  path: '/galerie',
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: 'Startseite', url: siteConfig.seo.domain },
  { name: 'Galerie', url: `${siteConfig.seo.domain}/galerie` },
]);

const GALLERY_PLACEHOLDER_BODY =
  'Medien aus der Galerie koennen vollstaendig in der Admin-Oberflaeche gepflegt werden.';

function splitBodyParagraphs(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function GalleryPage() {
  const page = await getPageContent('galerie');
  const galleryContent = normalizeGalleryPageSections(page?.sections);
  const mediaById = new Map(
    (page?.mediaLinks || []).map((link) => [link.media.id, link.media])
  );
  const headline = page?.headline?.trim() || DEFAULT_GALLERY_PAGE_HEADLINE;
  const subheadline = page?.subheadline?.trim() || DEFAULT_GALLERY_PAGE_SUBHEADLINE;
  const body =
    page?.body?.trim() && page.body.trim() !== GALLERY_PLACEHOLDER_BODY
      ? page.body.trim()
      : DEFAULT_GALLERY_PAGE_BODY;
  const introParagraphs = splitBodyParagraphs(body);

  return (
    <div className="pb-24 pt-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-6xl space-y-16">
          <StructuredDataScript data={breadcrumbSchema} />

          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <BreadcrumbTrail
                items={[
                  { label: 'Startseite', href: '/' },
                  { label: 'Galerie' },
                ]}
              />
            </div>
            <h1 className="font-serif text-6xl font-bold tracking-tight text-white md:text-8xl">{headline}</h1>
            <p className="mx-auto max-w-3xl text-xl font-light text-accent-200">{subheadline}</p>
          </div>

          <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-10">
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-400">
                  {galleryContent.introEyebrow}
                </p>
                <h2 className="font-serif text-4xl font-bold text-white md:text-5xl">
                  {galleryContent.introTitle}
                </h2>
              </div>

              {introParagraphs.map((paragraph) => (
                <p key={paragraph} className="leading-relaxed text-accent-200">
                  {paragraph}
                </p>
              ))}
            </article>

            <aside className="space-y-6 rounded-[2rem] border border-primary-500/25 bg-primary-500/10 p-8 md:p-10">
              <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
                {galleryContent.audienceTitle}
              </h2>
              <ul className="space-y-4 text-accent-100">
                {galleryContent.audienceItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href={galleryContent.primaryCtaHref || DEFAULT_GALLERY_PAGE_SECTIONS.primaryCtaHref}
                  className="rounded-full bg-primary-600 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
                >
                  {galleryContent.primaryCtaLabel || DEFAULT_GALLERY_PAGE_SECTIONS.primaryCtaLabel}
                </Link>
                <Link
                  href={galleryContent.secondaryCtaHref || DEFAULT_GALLERY_PAGE_SECTIONS.secondaryCtaHref}
                  className="rounded-full border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white/90"
                >
                  {galleryContent.secondaryCtaLabel || DEFAULT_GALLERY_PAGE_SECTIONS.secondaryCtaLabel}
                </Link>
              </div>
            </aside>
          </section>

          <div className="space-y-14">
            {galleryContent.sections.map((section) => {
              const images = section.images
                .map((image) => {
                  const media = image.mediaId ? mediaById.get(image.mediaId) || null : null;
                  const src = media ? getPublicMediaUrl(media.id, media.url) : image.url || '';
                  const altText = image.altText || media?.altText || section.title;

                  if (!src) return null;

                  return {
                    id: image.id || image.mediaId || image.url || `${section.key}-image`,
                    src,
                    altText,
                    caption: image.caption,
                  };
                })
                .filter(Boolean) as Array<{
                id: string;
                src: string;
                altText: string;
                caption: string;
              }>;

              if (images.length === 0) {
                return null;
              }

              return (
                <section key={section.key} className="space-y-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-3">
                      <h2 className="font-serif text-4xl font-bold text-white md:text-5xl">{section.title}</h2>
                      <p className="max-w-4xl leading-relaxed text-accent-200">{section.description}</p>
                    </div>
                    <Link href={section.ctaHref} className="text-sm font-semibold text-primary-300">
                      {section.ctaLabel}
                    </Link>
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {images.map((image) => (
                      <figure
                        key={image.id}
                        className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]"
                      >
                        <div className="relative aspect-square overflow-hidden">
                          <Image
                            src={image.src}
                            alt={image.altText}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                          />
                        </div>
                        {image.caption ? (
                          <figcaption className="p-4 text-sm leading-relaxed text-accent-200">
                            {image.caption}
                          </figcaption>
                        ) : null}
                      </figure>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
