import { NextRequest, NextResponse } from 'next/server';

const LEGACY_EXACT_PATHS = new Set([
  '/blog',
  '/hello-world',
  '/uncategorized',
  '/impressumdatenschutzerklarung',
  '/unsere_speisen.pdf',
  '/wp-login.php',
  '/xmlrpc.php',
  '/feed',
  '/comments/feed',
]);

const LEGACY_PREFIXES = [
  '/wp-admin',
  '/wp-content',
  '/wp-includes',
  '/category/',
  '/tag/',
  '/author/',
  '/comments/',
  '/archives/',
];

const LEGACY_QUERY_KEYS = ['p', 'page_id', 'm', 'cat', 'tag', 'author'];

const BOT_NOINDEX_HEADER = 'noindex, nofollow, noarchive';

function isLegacyPath(pathname: string) {
  const path = pathname.toLowerCase();

  if (LEGACY_EXACT_PATHS.has(path)) return true;
  if (LEGACY_PREFIXES.some((prefix) => path.startsWith(prefix))) return true;
  if (path.endsWith('.php')) return true;

  return false;
}

function isLegacyQuery(searchParams: URLSearchParams) {
  return LEGACY_QUERY_KEYS.some((key) => searchParams.has(key));
}

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (isLegacyPath(pathname) || isLegacyQuery(searchParams)) {
    return new NextResponse('Gone', {
      status: 410,
      headers: {
        'X-Robots-Tag': BOT_NOINDEX_HEADER,
        'Cache-Control': 'public, max-age=0, s-maxage=3600',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|robots.txt|sitemap.xml).*)'],
};

