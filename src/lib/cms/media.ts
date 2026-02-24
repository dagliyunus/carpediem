import { del, put } from '@vercel/blob';
import { MediaType } from '@prisma/client';
import { db } from '@/lib/db';

const MAX_UPLOAD_SIZE_BYTES = 150 * 1024 * 1024;
type BlobAccess = 'public' | 'private';

type UploadInput = {
  file: File;
  title?: string;
  altText?: string;
  caption?: string;
  uploadedById?: string;
};

function inferMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return MediaType.IMAGE;
  if (mimeType.startsWith('video/')) return MediaType.VIDEO;
  return MediaType.FILE;
}

function sanitizeFilename(name: string) {
  return name
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .toLowerCase();
}

function buildBlobPath(fileName: string, mediaType: MediaType) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const prefix =
    mediaType === MediaType.IMAGE ? 'images' : mediaType === MediaType.VIDEO ? 'videos' : 'files';
  const random = crypto.randomUUID();

  return `pivado/${prefix}/${year}/${month}/${random}-${fileName}`;
}

function resolveBlobAccess(): BlobAccess {
  return process.env.BLOB_ACCESS === 'private' ? 'private' : 'public';
}

export async function uploadMediaAsset({ file, title, altText, caption, uploadedById }: UploadInput) {
  if (!(file instanceof File)) {
    throw new Error('No file provided.');
  }

  if (file.size <= 0) {
    throw new Error('Empty file is not allowed.');
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error('File exceeds upload size limit.');
  }

  const mimeType = file.type || 'application/octet-stream';
  const mediaType = inferMediaType(mimeType);
  const cleanName = sanitizeFilename(file.name || 'upload.bin');
  const key = buildBlobPath(cleanName, mediaType);
  const preferredAccess = resolveBlobAccess();

  let uploaded: Awaited<ReturnType<typeof put>>;
  let effectiveAccess: BlobAccess = preferredAccess;

  try {
    uploaded = await put(key, file, {
      access: preferredAccess,
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch (error) {
    if (
      preferredAccess === 'public' &&
      error instanceof Error &&
      error.message.toLowerCase().includes('private store')
    ) {
      effectiveAccess = 'private';
      uploaded = await put(key, file, {
        access: 'private',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    } else {
      throw error;
    }
  }

  const media = await db.mediaAsset.create({
    data: {
      key,
      url: effectiveAccess === 'private' ? uploaded.downloadUrl : uploaded.url,
      filename: cleanName,
      mimeType,
      mediaType,
      sizeBytes: file.size,
      title: title?.trim() || null,
      altText: altText?.trim() || null,
      caption: caption?.trim() || null,
      uploadedById,
    },
  });

  return media;
}

export async function removeMediaAsset(mediaId: string) {
  const media = await db.mediaAsset.findUnique({
    where: { id: mediaId },
    include: {
      pageHeroFor: { select: { id: true, slug: true } },
      articleCoverFor: { select: { id: true, slug: true } },
      pageLinks: { select: { id: true, pageId: true } },
      articleLinks: { select: { id: true, articleId: true } },
      seoImages: { select: { id: true, targetType: true, targetId: true } },
      aliases: { select: { id: true, aliasPath: true } },
    },
  });

  if (!media) {
    throw new Error('Media not found.');
  }

  const isInUse =
    media.pageHeroFor.length > 0 ||
    media.articleCoverFor.length > 0 ||
    media.pageLinks.length > 0 ||
    media.articleLinks.length > 0 ||
    media.seoImages.length > 0 ||
    media.aliases.length > 0;

  if (isInUse) {
    throw new Error('Media is still linked to content. Remove links before deletion.');
  }

  await del(media.url, {
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  await db.mediaAsset.delete({
    where: { id: media.id },
  });
}
