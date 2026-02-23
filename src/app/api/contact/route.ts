import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type RateLimitState = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const MAX_CONTENT_LENGTH_BYTES = 12_000;
const MIN_FORM_FILL_MS = 2500;
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;
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

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 });
  }

  const contentLength = Number(req.headers.get('content-length') || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_CONTENT_LENGTH_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
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
  const formStartedAt = Number(body.formStartedAt);

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
  }
  if (!isValidEmail(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  if (subject.length < 3 || subject.length > 120) {
    return NextResponse.json({ error: 'Invalid subject' }, { status: 400 });
  }
  if (message.length < 10 || message.length > 2000) {
    return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
  }
  if (email.includes('\n') || email.includes('\r') || subject.includes('\n') || subject.includes('\r')) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  if (!Number.isFinite(formStartedAt)) {
    return NextResponse.json({ error: 'Invalid form state' }, { status: 400 });
  }

  const elapsedMs = Date.now() - formStartedAt;
  if (elapsedMs < MIN_FORM_FILL_MS) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
  if (elapsedMs > MAX_FORM_AGE_MS) {
    return NextResponse.json({ error: 'Form expired' }, { status: 400 });
  }

  const smtpHost = normalize(process.env.SMTP_HOST);
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = normalize(process.env.SMTP_USER);
  const smtpPass = normalize(process.env.SMTP_PASS);
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    return NextResponse.json({ error: 'Contact delivery not configured' }, { status: 500 });
  }

  const contactTo = normalize(process.env.CONTACT_TO_EMAIL) || 'viktoriia@carpediem-badsaarow.de';
  const contactFrom = normalize(process.env.CONTACT_FROM_EMAIL) || smtpUser;
  const contactFromName = normalize(process.env.CONTACT_FROM_NAME) || 'Kontaktformular Carpe Diem';

  const receivedAtIso = new Date().toISOString();
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replaceAll('\n', '<br />');
  const safeIp = escapeHtml(ip);
  const safeUa = escapeHtml(req.headers.get('user-agent') || '-');

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"${contactFromName}" <${contactFrom}>`,
      to: contactTo,
      replyTo: email,
      subject: `Neue Kontaktanfrage: ${subject}`,
      text: [
        'Neue Kontaktanfrage',
        `Name: ${name}`,
        `E-Mail: ${email}`,
        `Betreff: ${subject}`,
        `Nachricht: ${message}`,
        `IP: ${ip}`,
        `Eingang: ${receivedAtIso}`,
      ].join('\n'),
      html: `
        <h2>Neue Kontaktanfrage</h2>
        <table cellpadding="6" cellspacing="0" border="0">
          <tr><td><strong>Name</strong></td><td>${safeName}</td></tr>
          <tr><td><strong>E-Mail</strong></td><td>${safeEmail}</td></tr>
          <tr><td><strong>Betreff</strong></td><td>${safeSubject}</td></tr>
          <tr><td><strong>Nachricht</strong></td><td>${safeMessage}</td></tr>
          <tr><td><strong>IP</strong></td><td>${safeIp}</td></tr>
          <tr><td><strong>User-Agent</strong></td><td>${safeUa}</td></tr>
          <tr><td><strong>Eingang</strong></td><td>${receivedAtIso}</td></tr>
        </table>
      `,
    });
  } catch (error) {
    console.error('Contact email delivery failed', error);
    return NextResponse.json({ error: 'Delivery failed' }, { status: 502 });
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
        receivedAt: receivedAtIso,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Delivery failed' }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
