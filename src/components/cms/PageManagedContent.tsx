import Image from 'next/image';
import { getPageContent } from '@/lib/cms/queries';

type SectionItem = {
  title?: string;
  text?: string;
};

function isSectionArray(value: unknown): value is SectionItem[] {
  return Array.isArray(value);
}

export async function PageManagedContent({ slug }: { slug: string }) {
  const page = await getPageContent(slug);

  if (!page) return null;

  const sections = isSectionArray(page.sections) ? page.sections : [];
  const hasContent = Boolean(
    page.headline || page.subheadline || page.body || page.heroImage || sections.length > 0
  );

  if (!hasContent) return null;

  return (
    <section className="py-14">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur">
          {page.heroImage?.url ? (
            <div className="relative aspect-[16/7] border-b border-white/10">
              <Image
                src={page.heroImage.url}
                alt={page.heroImage.altText || page.title}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="space-y-5 p-8 md:p-10">
            {page.headline ? <h2 className="font-serif text-4xl md:text-5xl text-white">{page.headline}</h2> : null}
            {page.subheadline ? <p className="text-lg text-primary-200">{page.subheadline}</p> : null}
            {page.body ? <p className="text-accent-200 leading-relaxed whitespace-pre-wrap">{page.body}</p> : null}

            {sections.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 pt-3">
                {sections.map((section, index) => (
                  <article
                    key={`${slug}-section-${index + 1}`}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    {section.title ? (
                      <h3 className="mb-2 text-lg font-semibold text-primary-200">{section.title}</h3>
                    ) : null}
                    {section.text ? <p className="text-sm text-accent-200 whitespace-pre-wrap">{section.text}</p> : null}
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
