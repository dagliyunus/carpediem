# Carpe Diem Website

Next.js App Router website with a fully dynamic CMS backend:

- Neon Postgres (Prisma)
- Vercel Blob for images/videos/files
- Admin Panel (`/admin`) for non-technical content management
- Public magazine under `/magazin` (no `/blog` usage)

## Development

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run assets:migrate
npm run dev
```

Open `http://localhost:3000`.

Admin login page: `http://localhost:3000/admin/login`

## Production Build

```bash
npm run lint
npm run build
npm run start
```

## Core CMS Features

- Pages CRUD (`home`, `menu`, `drinks`, `galerie`, `kontakt`, `reservieren`, `magazin`)
- Magazin post CRUD (`/magazin` and `/magazin/[slug]`)
- Media library with Blob upload/delete and DB synchronization
- SEO metadata management (global/page/article)
- Social media account management
- AI agent configuration (Magazin, Instagram, Pinterest, TikTok)
- Contact and reservation inbox persistence in database
- Audit log of admin actions

## Environment Variables

Set these in Vercel Project Settings (Development/Preview/Production):

```bash
DATABASE_URL=
DATABASE_URL_UNPOOLED=
BLOB_READ_WRITE_TOKEN=
BLOB_ACCESS=public

NEXT_PUBLIC_SITE_URL=https://www.carpediem-badsaarow.de

ADMIN_EMAIL=admin@carpediem.local
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=

RESERVATION_FROM_NAME=Neu Tischreservierung
RESERVATION_FROM_EMAIL=
RESERVATION_TO_EMAIL=

CONTACT_FROM_NAME=Kontaktformular Carpe Diem
CONTACT_FROM_EMAIL=
CONTACT_TO_EMAIL=
CONTACT_WEBHOOK_URL=

NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

## Important Notes

- `/blog` remains blocked in robots/proxy legacy protection.
- Use `/magazin` for all editorial content.
- Media deletion in admin removes the Blob file and DB record only when not referenced by page/article/SEO.
- Legacy `/images/...` and `/favicon.ico` requests are DB-alias redirected to Blob URLs.
- Rotate secrets immediately if they were ever shared publicly.
