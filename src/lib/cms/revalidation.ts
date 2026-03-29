import { revalidatePath, revalidateTag } from 'next/cache';

export const PUBLIC_SITE_RUNTIME_TAG = 'public-site-runtime';
export const PUBLIC_PAGE_CONTENT_TAG = 'public-page-content';
export const PUBLIC_MAGAZIN_CONTENT_TAG = 'public-magazin-content';

export function revalidatePublicSiteRuntime() {
  revalidateTag(PUBLIC_SITE_RUNTIME_TAG, 'max');
  revalidatePath('/', 'layout');
}

export function revalidatePublicPageContent(path?: string) {
  revalidateTag(PUBLIC_PAGE_CONTENT_TAG, 'max');

  if (path) {
    revalidatePath(path);
  }
}

export function revalidatePublicPresentation(path?: string) {
  revalidatePublicSiteRuntime();
  revalidatePublicPageContent(path);
}

export function revalidatePublicMagazin(paths: string[] = []) {
  revalidateTag(PUBLIC_MAGAZIN_CONTENT_TAG, 'max');

  const targets = new Set(['/magazin', '/sitemap.xml', ...paths.filter(Boolean)]);

  for (const target of targets) {
    revalidatePath(target);
  }
}
