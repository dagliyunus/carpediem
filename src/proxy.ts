import { NextRequest, NextResponse } from 'next/server';

const LEGACY_EXACT_PATHS = new Set([
  '/blog',
  '/hello-world',
  '/uncategorized',
  '/uncategorized/hello-world',
  '/impressumdatenschutzerklarung',
  '/unsere_speisen.pdf',
  '/wp-content/uploads/2025/03/unsere_speisen.pdf',
  '/wp-login.php',
  '/xmlrpc.php',
  '/feed',
  '/comments/feed',
]);

const LEGACY_PREFIXES = [
  '/wp-admin',
  '/wp-content',
  '/wp-includes',
  '/uncategorized/',
  '/category/',
  '/tag/',
  '/author/',
  '/comments/',
  '/archives/',
];

const LEGACY_QUERY_KEYS = ['p', 'page_id', 'm', 'cat', 'tag', 'author'];

const BOT_NOINDEX_HEADER = 'noindex, nofollow, noarchive';
const INDEX_ALIAS_PATHS = new Set(['/index.html', '/index.php', '/index.htm']);

function isLegacyPath(pathname: string) {
  const path = pathname.toLowerCase();
  const normalizedPath = path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;

  if (LEGACY_EXACT_PATHS.has(normalizedPath)) return true;
  if (LEGACY_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix))) return true;
  if (normalizedPath.endsWith('.php')) return true;

  return false;
}

function isLegacyQuery(searchParams: URLSearchParams) {
  return LEGACY_QUERY_KEYS.some((key) => searchParams.has(key));
}

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const normalizedPath = pathname.toLowerCase();

  if (INDEX_ALIAS_PATHS.has(normalizedPath)) {
    const destination = req.nextUrl.clone();
    destination.pathname = '/';
    return NextResponse.redirect(destination, 308);
  }

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
