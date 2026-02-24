# Carpe Diem bei Ben

Website for Carpe Diem bei Ben (Bad Saarow), built with Next.js App Router.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Build

```bash
npm run lint
npm run build
npm run start
```

## Environment Variables

Set these in Vercel Project Settings (Production/Preview as needed):

```bash
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=

RESERVATION_FROM_NAME=Neu Tischreservierung
RESERVATION_FROM_EMAIL=
RESERVATION_TO_EMAIL=viktoriia@carpediem-badsaarow.de

CONTACT_FROM_NAME=Kontaktformular Carpe Diem
CONTACT_FROM_EMAIL=
CONTACT_TO_EMAIL=viktoriia@carpediem-badsaarow.de
CONTACT_WEBHOOK_URL=

NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

Notes:
- `RESERVATION_TO_EMAIL` defaults to `viktoriia@carpediem-badsaarow.de` if omitted.
- `CONTACT_TO_EMAIL` defaults to `viktoriia@carpediem-badsaarow.de` if omitted.
- `RESERVATION_FROM_EMAIL` and `CONTACT_FROM_EMAIL` should be valid sender addresses allowed by your SMTP provider.
- `CONTACT_WEBHOOK_URL` is optional.
