import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import nodemailer from 'nodemailer';
import { db } from '@/lib/db';
import { siteConfig } from '@/config/siteConfig';
import {
  getTodayIsoDate,
  getWeekdayFromIsoDate,
  isClosedDate,
  parseRequestedGuestCount,
} from '@/lib/reservations/capacity';
import { getSeatAvailabilityForDate } from '@/lib/reservations/availability';

type RateLimitState = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const SERIALIZABLE_RETRY_LIMIT = 3;
const rateLimit = new Map<string, RateLimitState>();

const normalize = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const isValidEmail = (value: string) => {
  if (value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const isValidTime = (value: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
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

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

class ReservationCapacityError extends Error {
  availableSeats: number;

  constructor(availableSeats: number) {
    super('Requested seats exceed the remaining daily capacity');
    this.availableSeats = availableSeats;
  }
}

const isSerializationConflict = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';

const reserveDailySeats = async (payload: {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  note: string;
  ip: string;
  requestedGuestCount: number;
}) => {
  for (let attempt = 0; attempt < SERIALIZABLE_RETRY_LIMIT; attempt += 1) {
    try {
      return await db.$transaction(
        async (tx) => {
          const availability = await getSeatAvailabilityForDate(payload.date, tx);

          if (payload.requestedGuestCount > availability.availableSeats) {
            throw new ReservationCapacityError(availability.availableSeats);
          }

          return tx.reservationRequest.create({
            data: {
              name: payload.name,
              email: payload.email,
              phone: payload.phone,
              date: payload.date,
              time: payload.time,
              guests: payload.guests,
              note: payload.note || null,
              ip: payload.ip,
              status: 'RECEIVED',
            },
          });
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
      );
    } catch (error) {
      if (error instanceof ReservationCapacityError) {
        throw error;
      }

      if (isSerializationConflict(error) && attempt < SERIALIZABLE_RETRY_LIMIT - 1) {
        continue;
      }

      throw error;
    }
  }

  throw new Error('Reservation capacity check failed after retries');
};

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = normalize(url.searchParams.get('date'));

  if (!date) {
    return NextResponse.json({ error: 'Missing date' }, { status: 400 });
  }

  const today = getTodayIsoDate();
  const weekday = getWeekdayFromIsoDate(date);

  if (weekday === null || date < today) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  const availability = await getSeatAvailabilityForDate(date);

  return NextResponse.json(
    {
      date,
      isClosed: isClosedDate(date),
      ...availability,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}

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

  const date = normalize(body.date);
  const time = normalize(body.time);
  const guests = normalize(body.guests);
  const name = normalize(body.name);
  const email = normalize(body.email).toLowerCase();
  const phone = normalize(body.phone);
  const note = normalize(body.note);
  const consent = body.consent === true;

  if (!date || !time || !guests || !name || !email || !phone || !consent) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const today = getTodayIsoDate();
  if (date < today) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }
  const weekday = getWeekdayFromIsoDate(date);
  if (weekday === null) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }
  if (weekday === 2 || weekday === 3) {
    return NextResponse.json(
      { error: 'Reservierungen sind am Dienstag und Mittwoch nicht möglich.' },
      { status: 400 }
    );
  }
  if (!isValidTime(time)) {
    return NextResponse.json({ error: 'Invalid time' }, { status: 400 });
  }
  if (toMinutes(time) > toMinutes(siteConfig.reservations.lastReservationTime)) {
    return NextResponse.json(
      { error: `Die letzte Reservierung ist nur bis ${siteConfig.reservations.lastReservationTime} Uhr möglich.` },
      { status: 400 }
    );
  }
  const requestedGuestCount = parseRequestedGuestCount(guests);
  if (!requestedGuestCount) {
    return NextResponse.json({ error: 'Invalid number of guests' }, { status: 400 });
  }
  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  if (phone.length < 6 || phone.length > 30) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
  }
  if (note.length > 1000) {
    return NextResponse.json({ error: 'Note too long' }, { status: 400 });
  }

  const smtpHost = normalize(process.env.SMTP_HOST);
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = normalize(process.env.SMTP_USER);
  const smtpPass = normalize(process.env.SMTP_PASS);
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    return NextResponse.json(
      { error: 'Reservation delivery not configured' },
      { status: 500 }
    );
  }

  const reservationTo =
    normalize(process.env.RESERVATION_TO_EMAIL) || 'viktoriia@carpediem-badsaarow.de';
  const reservationFrom = normalize(process.env.RESERVATION_FROM_EMAIL) || smtpUser;
  const reservationFromName = normalize(process.env.RESERVATION_FROM_NAME) || 'Neu Tischreservierung';

  let reservationId = '';

  try {
    const reservation = await reserveDailySeats({
      name,
      email,
      phone,
      date,
      time,
      guests,
      note,
      ip,
      requestedGuestCount,
    });

    reservationId = reservation.id;
  } catch (error) {
    if (error instanceof ReservationCapacityError) {
      return NextResponse.json(
        {
          error:
            error.availableSeats > 0
              ? `Für dieses Datum sind nur noch ${error.availableSeats} Sitzplätze verfügbar.`
              : 'Für dieses Datum sind online keine Sitzplätze mehr verfügbar.',
        },
        { status: 409 }
      );
    }

    console.error('Reservation capacity check failed', error);
    return NextResponse.json({ error: 'Reservation could not be saved' }, { status: 500 });
  }

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

    const safeName = escapeHtml(name);
    const safeDate = escapeHtml(date);
    const safeTime = escapeHtml(time);
    const safeGuests = escapeHtml(guests);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeNote = escapeHtml(note || '-');

    await transporter.sendMail({
      from: `"${reservationFromName}" <${reservationFrom}>`,
      to: reservationTo,
      replyTo: email,
      subject: `Neue Tischreservierung: ${date} ${time} (${guests} Pers.)`,
      text: [
        'Neue Reservierungsanfrage',
        `Name: ${name}`,
        `E-Mail: ${email}`,
        `Telefon: ${phone}`,
        `Datum: ${date}`,
        `Uhrzeit: ${time}`,
        `Personen: ${guests}`,
        `Anmerkung: ${note || '-'}`,
        `Einwilligung Datenschutz: ${consent ? 'Ja' : 'Nein'}`,
        `Eingang: ${new Date().toISOString()}`,
      ].join('\n'),
      html: `
        <h2>Neue Reservierungsanfrage</h2>
        <table cellpadding="6" cellspacing="0" border="0">
          <tr><td><strong>Name</strong></td><td>${safeName}</td></tr>
          <tr><td><strong>E-Mail</strong></td><td>${safeEmail}</td></tr>
          <tr><td><strong>Telefon</strong></td><td>${safePhone}</td></tr>
          <tr><td><strong>Datum</strong></td><td>${safeDate}</td></tr>
          <tr><td><strong>Uhrzeit</strong></td><td>${safeTime}</td></tr>
          <tr><td><strong>Personen</strong></td><td>${safeGuests}</td></tr>
          <tr><td><strong>Anmerkung</strong></td><td>${safeNote}</td></tr>
          <tr><td><strong>Einwilligung Datenschutz</strong></td><td>${consent ? 'Ja' : 'Nein'}</td></tr>
          <tr><td><strong>Eingang</strong></td><td>${new Date().toISOString()}</td></tr>
        </table>
      `,
    });
  } catch (error) {
    console.error('Reservation email delivery failed', error);
    await db.reservationRequest
      .update({
        where: { id: reservationId },
        data: { status: 'EMAIL_FAILED' },
      })
      .catch((updateError) => {
        console.error('Reservation email failure status update failed', updateError);
      });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
