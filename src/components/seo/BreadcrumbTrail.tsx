import Link from 'next/link';

type BreadcrumbTrailProps = {
  items: Array<{
    label: string;
    href?: string;
  }>;
};

export function BreadcrumbTrail({ items }: BreadcrumbTrailProps) {
  return (
    <nav aria-label="Breadcrumb" className="font-blog flex flex-wrap items-center gap-2 text-sm text-accent-300">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} className="text-primary-300 transition-colors hover:text-primary-200">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-white/90' : undefined}>{item.label}</span>
            )}
            {!isLast ? <span className="text-white/20">/</span> : null}
          </span>
        );
      })}
    </nav>
  );
}
