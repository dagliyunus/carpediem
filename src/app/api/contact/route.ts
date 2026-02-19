import { NextResponse } from 'next/server';

type RateLimitState = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimit = new Map<string, RateLimitState>();

const normalize = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const isValidEmail = (value: string) => {
  if (value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const getClientIp = (req: Request) => {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown';
  return req.headers.get('x-real-ip') || 'unknown';
};

const isAllowedOrigin = (req: Request) => {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (!origin || !host) return true;
  return origin === `https://${host}` || origin === `http://${host}`;
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

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ip = getClientIp(req);
  if (!rateLimitOk(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const company = normalize(body.company);
  if (company) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const name = normalize(body.name);
  const email = normalize(body.email).toLowerCase();
  const subject = normalize(body.subject);
  const message = normalize(body.message);

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  if (name.length > 80) return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
  if (!isValidEmail(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  if (subject.length > 120) return NextResponse.json({ error: 'Invalid subject' }, { status: 400 });
  if (message.length < 10 || message.length > 2000) {
    return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
  }

  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'carpediem-contact-form',
      },
      body: JSON.stringify({
        name,
        email,
        subject,
        message,
        receivedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Delivery failed' }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

