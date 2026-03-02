import Link from 'next/link';

type PaginationProps = {
  page: number;
  pageCount: number;
  buildHref: (page: number) => string;
};

export function MagazinPagination({ page, pageCount, buildHref }: PaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(pageCount, page + 2);
  const visiblePages = Array.from({ length: windowEnd - windowStart + 1 }, (_, index) => windowStart + index);

  return (
    <nav aria-label="Pagination" className="font-blog flex flex-wrap items-center justify-center gap-2 pt-4">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${
          page === 1
            ? 'pointer-events-none border-white/10 text-white/30'
            : 'border-white/15 text-white/90 hover:border-primary-400/40'
        }`}
      >
        Zurück
      </Link>

      {visiblePages.map((item) => (
        <Link
          key={item}
          href={buildHref(item)}
          aria-current={item === page ? 'page' : undefined}
          className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${
            item === page
              ? 'border-primary-400/50 bg-primary-500/15 text-primary-100'
              : 'border-white/15 text-white/90 hover:border-primary-400/40'
          }`}
        >
          {item}
        </Link>
      ))}

      <Link
        href={buildHref(Math.min(pageCount, page + 1))}
        aria-disabled={page === pageCount}
        className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${
          page === pageCount
            ? 'pointer-events-none border-white/10 text-white/30'
            : 'border-white/15 text-white/90 hover:border-primary-400/40'
        }`}
      >
        Weiter
      </Link>
    </nav>
  );
}
