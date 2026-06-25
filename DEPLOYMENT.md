# Deployment Guide — Dr. Greeshma Connect

Stack: **Supabase** (PostgreSQL) · **Render** (Express API) · **Vercel** (Next.js frontend)

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 22 | [nodejs.org](https://nodejs.org) |
| pnpm | 9.x | `npm i -g pnpm@9` |
| Prisma CLI | bundled | `pnpm --filter api db:deploy` |
| Render CLI (optional) | latest | `npm i -g @render-com/cli` |
| Vercel CLI (optional) | latest | `npm i -g vercel` |

Accounts required before first deploy:

- [supabase.com](https://supabase.com) — existing project (DB already seeded)
- [render.com](https://render.com) — free or Starter plan
- [vercel.com](https://vercel.com) — Hobby plan is sufficient
- [console.cloud.google.com](https://console.cloud.google.com) — OAuth 2.0 client for Calendar + Sign-In
- [dashboard.razorpay.com](https://dashboard.razorpay.com) — live mode key pair + webhook

---

## Environment Variables

### Render (backend — `apps/api`)

Set these in **Render Dashboard → your service → Environment**.  
Reference file: [`apps/api/.env.production.example`](apps/api/.env.production.example)

| Variable | Example / Notes |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://postgres.<ref>:<pwd>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres:<pwd>@db.<ref>.supabase.co:5432/postgres` |
| `JWT_ACCESS_SECRET` | `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | `openssl rand -base64 32` |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `CORS_ORIGINS` | `https://<your-app>.vercel.app` |
| `GOOGLE_CLIENT_ID` | from Google Console |
| `GOOGLE_CLIENT_SECRET` | from Google Console |
| `GOOGLE_CALENDAR_ID` | `primary` |
| `GOOGLE_REDIRECT_URI` | `https://<render-svc>.onrender.com/google/callback` |
| `GOOGLE_OAUTH_SUCCESS_URL` | `https://<your-app>.vercel.app/admin/availability` |
| `RAZORPAY_KEY_ID` | `rzp_live_…` |
| `RAZORPAY_KEY_SECRET` | from Razorpay Dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | from Razorpay Dashboard → Webhooks |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | your Gmail address |
| `SMTP_PASS` | Gmail App Password (16 chars, no spaces) |
| `SMTP_FROM` | `Dr. Greeshma Connect <no-reply@gmail.com>` |
| `WHATSAPP_TOKEN` | Meta permanent access token |
| `WHATSAPP_PHONE_ID` | Meta phone number ID |
| `WHATSAPP_VERIFY_TOKEN` | any random string — matches Meta webhook config |
| `WHATSAPP_TEMPLATE_BOOKING_CONFIRMED` | `booking_confirmed` |
| `WHATSAPP_TEMPLATE_BOOKING_RESCHEDULED` | `booking_rescheduled` |
| `WHATSAPP_TEMPLATE_BOOKING_CANCELLED` | `booking_cancelled` |
| `WHATSAPP_TEMPLATE_REMINDER_24H` | `appointment_reminder_24h` |
| `WHATSAPP_TEMPLATE_REMINDER_1H` | `appointment_reminder_1h` |

> **URL encoding:** If your DB password contains `@`, encode it as `%40` inside `DATABASE_URL` and `DIRECT_URL`. A password with only alphanumeric + `_` `-` chars needs no encoding.

### Vercel (frontend — `apps/web`)

Set these in **Vercel Dashboard → your project → Settings → Environment Variables**.  
Reference file: [`apps/web/.env.production.example`](apps/web/.env.production.example)

| Variable | Example / Notes |
|---|---|
| `NEXTAUTH_URL` | `https://<your-app>.vercel.app` (no trailing slash) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXT_PUBLIC_API_URL` | `https://<render-svc>.onrender.com` (browser-side fetch) |
| `API_URL` | same as above (server-side, used in `auth.ts` Credentials provider) |
| `GOOGLE_CLIENT_ID` | same as Render |
| `GOOGLE_CLIENT_SECRET` | same as Render |

---

## First-Deploy Order

Run these steps in sequence. Each step depends on the one before it.

### Step 1 — Rotate the database password

1. Go to **Supabase Dashboard → Settings → Database → Reset Database Password**
2. Click **Generate** to get a strong random password
3. Copy it immediately — you will not see it again
4. Update `DATABASE_URL` and `DIRECT_URL` with the new password before pasting into Render

### Step 2 — Run database migrations

Using the new production credentials, run from the repo root:

```bash
# Set the direct (non-pooled) connection for migrate deploy
export DIRECT_URL="postgresql://postgres:<NEW_PWD>@db.<ref>.supabase.co:5432/postgres"
export DATABASE_URL="postgresql://postgres.<ref>:<NEW_PWD>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

pnpm --filter api db:deploy
# → prisma migrate deploy --schema src/prisma/schema.prisma
```

`migrate deploy` uses `DIRECT_URL` (non-pooled), which avoids the pgbouncer advisory-lock timeout (P1002) that `migrate dev` would hit.

> If you have never run migrations (only `db:push` during development), your schema is already applied — `migrate deploy` will mark the baseline migration as applied and exit cleanly.

### Step 3 — Deploy the backend to Render

1. Go to **render.com → New → Blueprint** and import your GitHub repo
2. Render reads [`render.yaml`](render.yaml) from the repo root automatically
3. You will see a checklist of `sync: false` env vars to fill in — paste all values from Step 1 and the table above
4. Click **Apply** — Render will:
   - Run `pnpm install --frozen-lockfile`
   - Build `packages/shared` then `apps/api`
   - Run `prisma migrate deploy` as a pre-deploy command
   - Start `node apps/api/dist/index.js`
5. Wait for the health check at `/health` to return 200
6. Copy the service URL: `https://<render-svc>.onrender.com`

### Step 4 — Deploy the frontend to Vercel

1. Go to **vercel.com → Add New Project** and import the same GitHub repo
2. **Root Directory** → set to `apps/web`
3. Framework Preset → Next.js (auto-detected)
4. Install/build commands → leave blank (read from `apps/web/vercel.json`)
5. Add the 6 environment variables from the Vercel table above, using the Render URL from Step 3
6. Click **Deploy**
7. Copy the live domain: `https://<your-app>.vercel.app`

### Step 5 — Wire up external services

**Google Cloud Console** (`console.cloud.google.com → Credentials → your OAuth client`):

Add to **Authorized redirect URIs**:
```
https://<your-app>.vercel.app/api/auth/callback/google
https://<render-svc>.onrender.com/google/callback
```

Add to **Authorized JavaScript origins**:
```
https://<your-app>.vercel.app
```

**Razorpay Dashboard** (`Settings → Webhooks → Add`):
```
URL:    https://<render-svc>.onrender.com/webhooks/razorpay
Secret: <RAZORPAY_WEBHOOK_SECRET value>
Events: payment.captured  payment.failed  refund.created
```

### Step 6 — Update Render with live URLs

Back in Render → Environment, fill the two remaining vars now that you have the Vercel domain:

```
CORS_ORIGINS          = https://<your-app>.vercel.app
GOOGLE_OAUTH_SUCCESS_URL = https://<your-app>.vercel.app/admin/availability
```

Trigger a **Manual Deploy** so Render picks up the new values.

---

## Secret Rotation Guide

All secrets should be rotated:
- When a team member leaves
- After any suspected credential leak
- Every 90 days for JWT secrets (good hygiene)

### Rotate JWT secrets

```bash
openssl rand -base64 32   # new JWT_ACCESS_SECRET
openssl rand -base64 32   # new JWT_REFRESH_SECRET
```

Paste both into Render → Environment. All existing sessions will be invalidated immediately — users will be logged out and need to sign in again. This is expected.

### Rotate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Paste into Vercel → Environment Variables → `NEXTAUTH_SECRET`. Existing sessions are invalidated.

### Rotate the database password

1. Supabase Dashboard → Settings → Database → Reset Database Password
2. Update `DATABASE_URL` and `DIRECT_URL` on Render with the new password
3. Trigger a Manual Deploy — the old connection strings stop working immediately after the Supabase reset, so do not wait

### Rotate Razorpay webhook secret

1. Razorpay Dashboard → Settings → Webhooks → edit your webhook → regenerate secret
2. Update `RAZORPAY_WEBHOOK_SECRET` on Render
3. Trigger Manual Deploy

---

## Go-Live Smoke-Test Checklist

Run these manually after all six deploy steps complete.

### Backend (`https://<render-svc>.onrender.com`)

- [ ] `GET /health` returns `{ status: "ok" }` with HTTP 200
- [ ] `GET /services` returns an array of active services (public endpoint)
- [ ] `POST /auth/login` with wrong password returns HTTP 401
- [ ] `POST /auth/login` with valid doctor credentials returns `accessToken`
- [ ] `GET /admin/stats` with doctor token returns stats object

### Frontend (`https://<your-app>.vercel.app`)

- [ ] Landing page loads with 3D orb and hero section
- [ ] `/login` page renders and accepts credentials
- [ ] `/book` wizard loads service list from live API
- [ ] Booking wizard completes to confirmation page
- [ ] `/admin` redirects to `/login` when unauthenticated
- [ ] Doctor login → `/admin` dashboard loads with real stats

### Auth flows

- [ ] Patient registers → email confirmation → books appointment
- [ ] Google Sign-In button appears and redirects to Google
- [ ] After Google auth, patient lands on `/` with session

### Payments

- [ ] Book appointment → Razorpay checkout modal opens
- [ ] Razorpay test card (`4111 1111 1111 1111`) completes payment
- [ ] Appointment status moves to CONFIRMED
- [ ] Meet link appears on confirmation page (if Google Calendar connected)

### Notifications

- [ ] Booking confirmation email arrives within 60 seconds
- [ ] Check Render logs (`render logs`) — no SMTP or WhatsApp errors

### Google Calendar (after doctor connects)

- [ ] `/admin/availability` → Connect Google Calendar → OAuth flow completes
- [ ] Book a test appointment → event appears in doctor's Google Calendar
- [ ] Meet link is visible on patient's confirmation page

---

## Free-Tier Limitations

| Service | Limitation | Fix |
|---|---|---|
| Render free | Spins down after 15 min idle; ~30s cold start on first request | Upgrade to Starter ($7/mo) |
| Render free | 750 hours/month (enough for one service) | Starter removes the limit |
| Vercel Hobby | 100 GB bandwidth/month | Upgrade if traffic grows |
| Supabase free | 500 MB DB, 2 GB bandwidth, pauses after 7 days inactivity | Upgrade to Pro ($25/mo) |

To prevent Supabase free-tier pausing, set up a cron ping or upgrade to Pro.

---

## Useful Commands

```bash
# Check API logs on Render
render logs --service dr-greeshma-api --tail

# Re-run migrations manually (emergency)
DIRECT_URL="..." pnpm --filter api db:deploy

# Generate fresh secrets
openssl rand -base64 32

# Test CORS headers from command line
curl -I -H "Origin: https://<your-app>.vercel.app" \
  https://<render-svc>.onrender.com/health
```
