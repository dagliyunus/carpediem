import { revalidatePath, revalidateTag } from 'next/cache';

export const PUBLIC_SITE_RUNTIME_TAG = 'public-site-runtime';
export const PUBLIC_PAGE_CONTENT_TAG = 'public-page-content';

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
