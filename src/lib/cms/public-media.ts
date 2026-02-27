export function getPublicMediaUrl(mediaId?: string | null, fallbackUrl?: string | null) {
  if (mediaId) {
    return `/api/media/${mediaId}`;
  }

  return fallbackUrl || '';
}
