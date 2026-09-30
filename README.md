# ReadnLearn

A learning management system that connects students with tutors. Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma 7 and PostgreSQL 18.

## Getting started

```bash
npm install
cp .env.example .env          # then fill in secrets (see below)
npm run db:deploy             # apply migrations
npm run db:seed               # creates the single admin account
npm run db:seed:demo          # optional: demo tutors, courses, students and reviews
npm run dev        # Next.js + Socket.io in one process (live chat)
```

| Account | Login | Password |
| --- | --- | --- |
| Admin (at `/admin/login`) | `Admin` | `Admin@2007` |
| Demo tutors/students (at `/login`) | e.g. `amara@demo.readnlearn.com`, `maya@demo.readnlearn.com` | `Password@123` |

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server with live chat (custom server: Next.js + Socket.io) |
| `npm run build` then `npm start` | Production build and server (same custom server, so chat is live) |
| `npm run dev:next` / `start:next` | Plain Next.js without Socket.io (chat falls back to polling) |
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

## Features by role

**Student:** dashboard (progress, upcoming lessons, announcements, unread counts), my courses with lessons / assignments / materials, submit work by link, review courses, announcement inbox with read tracking, one-to-one chat with tutors.

**Tutor:** dashboard, course create / edit / publish / delete (blocked while students are enrolled), batches with manual student assignment, lesson scheduling with edit and cancel, attendance per lesson plus history matrix, assignments and grading with feedback, announcements to a course or a single batch, course materials, analytics (charts with a table view), referral link, chat with enrolled students and message-history search.

**Admin:** account approvals, audit log (see above).

## More architecture notes

- **Realtime:** `server.ts` runs Next.js and Socket.io on one port. Messages are validated, saved and emailed by normal API routes, which then push to the recipient over the socket. Sockets authenticate with the NextAuth session cookie. If sockets are unavailable, the chat polls every 12 seconds.
- **Chat rules:** students can message any active tutor. Tutors can message students enrolled in their courses, or reply to a student who wrote first. Email goes out once per unread streak, not per message.
- **Ownership:** every tutor query is scoped to the signed-in tutor (`src/lib/tutor-access.ts`), so another tutor's batch or course returns 404.
- **Progress** is the share of a student's non-cancelled lessons they attended (present or late). It is recalculated whenever attendance, lessons or batch membership change.
- **Submissions** are links (http or https only). File uploads would need S3 or R2, which is not wired up yet.
- **Dates** are shown in each viewer's own timezone.

## Status

Done: everything in the feature list above, plus the public site, auth and admin panel.

Not built: Stripe checkout (paid courses cannot be bought yet, so revenue in analytics is an estimate), file uploads, user blocking in chat.
