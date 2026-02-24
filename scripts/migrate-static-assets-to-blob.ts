import { promises as fs } from 'node:fs';
import path from 'node:path';
import { put } from '@vercel/blob';
import { MediaType, PrismaClient } from '@prisma/client';
import { lookup as mimeLookup } from 'mime-types';

const prisma = new PrismaClient();

type BlobAccess = 'public' | 'private';

type LocalAsset = {
  absolutePath: string;
  aliasPath: string;
};

const PROJECT_ROOT = process.cwd();
const PUBLIC_IMAGES_DIR = path.join(PROJECT_ROOT, 'public', 'images');
const APP_FAVICON_PATH = path.join(PROJECT_ROOT, 'src', 'app', 'favicon.ico');

function resolvePreferredBlobAccess(): BlobAccess {
  return process.env.BLOB_ACCESS === 'private' ? 'private' : 'public';
}

function inferMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return MediaType.IMAGE;
  if (mimeType.startsWith('video/')) return MediaType.VIDEO;
  return MediaType.FILE;
}

async function listFilesRecursively(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listFilesRecursively(fullPath);
      return [fullPath];
    })
  );

  return nested.flat();
}

async function collectLocalAssets(): Promise<LocalAsset[]> {
  const results: LocalAsset[] = [];

  try {
    const imageFiles = await listFilesRecursively(PUBLIC_IMAGES_DIR);
    for (const file of imageFiles) {
      const relative = path.relative(path.join(PROJECT_ROOT, 'public'), file).split(path.sep).join('/');
      results.push({
        absolutePath: file,
        aliasPath: `/${relative}`,
      });
    }
  } catch {
    // ignore when directory does not exist
  }

  try {
    await fs.access(APP_FAVICON_PATH);
    results.push({
      absolutePath: APP_FAVICON_PATH,
      aliasPath: '/favicon.ico',
    });
  } catch {
    // ignore when favicon file does not exist
  }

  return results;
}

function blobKeyForAlias(aliasPath: string) {
  return `legacy-assets${aliasPath}`.replace(/^\/+/, '');
}

async function uploadAsset(asset: LocalAsset, preferredAccess: BlobAccess) {
  const fileBuffer = await fs.readFile(asset.absolutePath);
  const filename = path.basename(asset.absolutePath);
  const mimeType = mimeLookup(filename) || 'application/octet-stream';
  const mediaType = inferMediaType(mimeType);
  const key = blobKeyForAlias(asset.aliasPath);

  const file = new File([fileBuffer], filename, { type: mimeType });

  let uploaded: Awaited<ReturnType<typeof put>>;
  let effectiveAccess = preferredAccess;

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

  const finalUrl = effectiveAccess === 'private' ? uploaded.downloadUrl : uploaded.url;

  const media = await prisma.mediaAsset.upsert({
    where: { key },
    update: {
      url: finalUrl,
      filename,
      mimeType,
      mediaType,
      sizeBytes: fileBuffer.byteLength,
      title: filename,
      altText: filename,
      caption: `Legacy static asset migrated from ${asset.aliasPath}`,
    },
    create: {
      key,
      url: finalUrl,
      filename,
      mimeType,
      mediaType,
      sizeBytes: fileBuffer.byteLength,
      title: filename,
      altText: filename,
      caption: `Legacy static asset migrated from ${asset.aliasPath}`,
    },
  });

  await prisma.assetAlias.upsert({
    where: { aliasPath: asset.aliasPath },
    update: { mediaId: media.id },
    create: {
      aliasPath: asset.aliasPath,
      mediaId: media.id,
    },
  });

  return {
    aliasPath: asset.aliasPath,
    mediaId: media.id,
    key,
    url: finalUrl,
    sizeBytes: fileBuffer.byteLength,
  };
}

async function main() {
  if (!process.env.DATABASE_URL && !process.env.DATABASE_URL_UNPOOLED) {
    throw new Error('DATABASE_URL or DATABASE_URL_UNPOOLED is required.');
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is required.');
  }

  const assets = await collectLocalAssets();
  if (assets.length === 0) {
    console.log('No local static assets found for migration.');
    return;
  }

  const preferredAccess = resolvePreferredBlobAccess();

  console.log(`Migrating ${assets.length} assets to Blob (${preferredAccess} preferred)...`);

  let totalBytes = 0;

  for (const asset of assets) {
    const result = await uploadAsset(asset, preferredAccess);
    totalBytes += result.sizeBytes;
    console.log(`✓ ${result.aliasPath} -> ${result.url}`);
  }

  const mb = (totalBytes / (1024 * 1024)).toFixed(2);
  console.log(`Done. Migrated ${assets.length} files (${mb} MB).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
