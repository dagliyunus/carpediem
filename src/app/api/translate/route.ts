import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SITE_LANGUAGES, isSiteLanguageCode } from '@/lib/translation/languages';

const requestSchema = z.object({
  texts: z.array(z.string().trim().min(1).max(4000)).min(1).max(50),
  targetLanguage: z.string().refine(isSiteLanguageCode, { message: 'Unsupported language' }),
});

type RateLimitState = {
  count: number;
  resetAt: number;
};

const MAX_BODY_BYTES = 120 * 1024;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 60;
const rateLimit = new Map<string, RateLimitState>();

const normalize = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const getClientIp = (req: Request) => {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown';
  return req.headers.get('x-real-ip') || 'unknown';
};

const isAllowedOrigin = (req: Request) => {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = req.headers.get('host');
  if (!host) return false;

  const allowedOrigins = new Set([`https://${host}`, `http://${host}`]);
  if (origin) return allowedOrigins.has(origin);

  if (referer) {
    for (const allowed of allowedOrigins) {
      if (referer === allowed || referer.startsWith(`${allowed}/`)) {
        return true;
      }
    }
  }

  return process.env.NODE_ENV !== 'production';
};

const rateLimitOk = (key: string) => {
  const now = Date.now();
  const current = rateLimit.get(key);
  if (!current || now >= current.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (current.count >= RATE_LIMIT_MAX) return false;
  current.count += 1;
  rateLimit.set(key, current);
  return true;
};

const deeplTargetMap = new Map(SITE_LANGUAGES.map((language) => [language.code, language.deeplTarget]));

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 });
  }

  const contentLength = Number(req.headers.get('content-length') || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  const ip = getClientIp(req);
  if (!rateLimitOk(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const apiKey = normalize(process.env.DEEPL_API_KEY);
  if (!apiKey) {
    return NextResponse.json({ error: 'Translation service not configured' }, { status: 503 });
  }

  const payload = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid translation payload', details: parsed.error.issues }, { status: 400 });
  }

  if (parsed.data.targetLanguage === 'de') {
    return NextResponse.json({ translations: parsed.data.texts });
  }

  const totalBytes = Buffer.byteLength(JSON.stringify(parsed.data), 'utf8');
  if (totalBytes > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  const targetLang = deeplTargetMap.get(parsed.data.targetLanguage) ?? 'DE';
  const endpoint = normalize(process.env.DEEPL_API_URL) || 'https://api-free.deepl.com/v2/translate';

  const deeplResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: parsed.data.texts,
      source_lang: 'DE',
      target_lang: targetLang,
      preserve_formatting: true,
    }),
    cache: 'no-store',
  });

  if (!deeplResponse.ok) {
    const errorText = await deeplResponse.text().catch(() => '');
    console.error('DeepL translation failed', deeplResponse.status, errorText);
    return NextResponse.json({ error: 'Translation request failed' }, { status: 502 });
  }

  const deeplPayload = (await deeplResponse.json().catch(() => null)) as
    | { translations?: Array<{ text?: string | null }> }
    | null;

  const translations = deeplPayload?.translations?.map((item) => item.text ?? '') ?? [];
  if (translations.length !== parsed.data.texts.length) {
    return NextResponse.json({ error: 'Incomplete translation response' }, { status: 502 });
  }

  return NextResponse.json({ translations });
}
