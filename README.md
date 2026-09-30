# ReadnLearn

A learning management system that connects students with tutors. Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma 7 and PostgreSQL 18.

## Getting started

```bash
npm install
cp .env.example .env          # then fill in secrets (see below)
npm run db:deploy             # apply migrations
npm run db:seed               # creates the single admin account
npm run db:seed:demo          # optional: demo tutors, courses, students and reviews
npm run dev
```

| Account | Login | Password |
| --- | --- | --- |
| Admin (at `/admin/login`) | `Admin` | `Admin@2007` |
| Demo tutors/students (at `/login`) | e.g. `amara@demo.readnlearn.com`, `maya@demo.readnlearn.com` | `Password@123` |

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run db:migrate` | Create and apply a migration from `prisma/schema.prisma` changes |
| `npm run db:deploy` | Apply pending migrations (CI / production) |
| `npm run db:seed` | Seed the admin account (idempotent) |
| `npm run db:seed:demo` | Seed demo content (idempotent) |
| `npm test` | Jest unit tests |
| `npm run lint` | ESLint |

## Environment

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | NextAuth; the secret also keys reset-code HMACs |
| `ADMIN_SESSION_SECRET` | Signs the separate admin session cookie |
| `APP_URL` | Absolute URL used in emails and referral links |
| `ADMIN_NOTIFY_EMAIL` | Receives "new signup pending approval" and contact-form emails |
| `SMTP_*`, `EMAIL_FROM` | Any SMTP provider (SendGrid: host `smtp.sendgrid.net`, user `apikey`). When `SMTP_HOST` is empty, emails are printed to the server console instead |

## Architecture notes

- **Two auth systems on purpose.** Students and tutors use NextAuth (credentials, JWT in an httpOnly cookie, 30-day sliding expiry). The admin uses a separate `rnl_admin` cookie (HS256 via `jose`, 8 h, `SameSite=Strict`) with its own login route, so the admin surface can't be reached through the user login.
- **Route protection** lives in `src/proxy.ts` (Next 16's replacement for `middleware.ts`). Server pages and API routes re-check auth themselves; the proxy is the fast first line.
- **Account status** is enforced at login (`pending`, `inactive` and `rejected` get distinct messages, shown only after the password is verified) and re-checked every 5 minutes inside the JWT callback, so a deactivated user is logged out quickly.
- **Rate limits** are stored in the `rate_limits` table, not in memory, so they hold across serverless instances. Admin login allows 3 failures, then a 15-minute lockout, keyed by client IP.
  - IPs come from `x-forwarded-for`. This is trustworthy on Vercel, but a self-hosted deployment must sit behind a proxy that overwrites the header.
- **Password reset** uses 6-digit codes stored as HMAC hashes. Each code is single-use, expires after 15 minutes, and allows at most 5 guesses. The API never reveals whether an email exists.
- **Full-text search** uses Postgres GIN *expression* indexes (see `prisma/migrations/*_fts_expression_indexes`). Queries in `src/lib/catalog.ts` must use the exact same expressions to hit the index. Expression indexes are used instead of generated columns because Prisma's migration diffing mishandles generated columns.
- **Database-level guarantees:**
  - CHECK constraints on prices, ratings and dates.
  - A partial unique index allowing exactly one admin.
  - Unique `(student, course)` enrollments.
- **API responses** always look like `{ data }` or `{ error: { code, message, fields? } }`.

## Status

Done:
- Project setup
- Schema and seeds
- Public site: marketing pages, catalog, tutor directory, course and tutor profiles
- Auth: signup with approval, login with status checks, password reset, referrals
- Admin panel: pending accounts, accept/reject with emails, audit log, live badge
- Free-course enrollment
- Starter student and tutor dashboards

Next:
- Full student dashboard: lessons, announcements
- Stripe checkout
- Tutor tools: course, batch, lesson, attendance, assignment and announcement management
- Socket.io messaging
- Analytics
