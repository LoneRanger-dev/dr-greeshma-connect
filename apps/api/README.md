# Dr. Greeshma Connect — API

Express + TypeScript backend. Runs on **port 4000** by default.

---

## Setup

```bash
# From monorepo root
pnpm install

# In apps/api — copy .env.example and fill in values
cp .env.example .env

# Generate Prisma client
pnpm db:generate

# Push schema to DB (dev) or run migrations (prod)
pnpm db:push          # dev
pnpm db:migrate       # generate + apply named migration

# Seed the database
pnpm seed

# Start dev server with hot-reload
pnpm dev
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | `development` \| `production` | `development` |
| `PORT` | Server port | `4000` |
| `DATABASE_URL` | Supabase pooler URL (port 6543, pgbouncer=true) | `postgresql://...` |
| `DIRECT_URL` | Supabase direct URL (port 5432) | `postgresql://...` |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens | (random 32+ chars) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | (random 32+ chars) |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `7d` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (Calendar + Meet) | (Step 11) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | (Step 11) |
| `GOOGLE_CALENDAR_ID` | Calendar to create events on | `primary` |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | `http://localhost:4000/google/callback` |
| `GOOGLE_OAUTH_SUCCESS_URL` | Where to redirect after OAuth | `http://localhost:3006/admin/availability` |
| `GOOGLE_REFRESH_TOKEN` | Pre-obtained refresh token (Option B setup) | (optional) |
| `RAZORPAY_KEY_ID` | Razorpay key | (Step 12) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | (Step 12) |
| `SMTP_*` | Email delivery config | (Step 13) |
| `WHATSAPP_*` | WhatsApp / Twilio config | (Step 13) |

---

## Routes

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | Service health check |

**Response 200:**
```json
{ "status": "ok", "timestamp": "2026-06-24T10:00:00.000Z", "env": "development" }
```

---

### Auth — `/auth`

> All auth routes are rate-limited.  
> Tokens are set as **httpOnly, secure, sameSite=strict** cookies (`accessToken`, `refreshToken`).  
> Tokens are also returned in the response body for API clients.

| Method | Path | Auth | Rate limit | Description |
|---|---|---|---|---|
| POST | `/auth/register` | None | 5 / hour | Register a new patient account |
| POST | `/auth/login` | None | 10 / 15 min | Log in with email + password |
| POST | `/auth/refresh` | None | — | Rotate access token using refresh token |
| POST | `/auth/logout` | None | — | Clear auth cookies |
| GET | `/auth/me` | Bearer / cookie | — | Return the authenticated user |
| POST | `/auth/otp/request` | None | 10 / 15 min | Send OTP to phone (stub) |
| POST | `/auth/otp/verify` | None | 10 / 15 min | Verify OTP and log in / auto-register |

#### POST `/auth/register`

```json
// Request body
{
  "name":     "Priya Sharma",
  "email":    "priya@example.com",
  "phone":    "+919876543210",   // optional
  "password": "Str0ng!Pass"
}

// Response 201
{
  "data": {
    "user": { "id": "...", "name": "Priya Sharma", "email": "...", "role": "PATIENT", ... },
    "accessToken":  "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

#### POST `/auth/login`

```json
// Request body
{ "email": "priya@example.com", "password": "Str0ng!Pass" }

// Response 200 — same shape as register
```

#### POST `/auth/refresh`

```json
// Reads refreshToken from cookie (preferred) or body: { "refreshToken": "..." }

// Response 200
{ "data": { "accessToken": "<new-jwt>" } }
```

#### GET `/auth/me`

```
Authorization: Bearer <accessToken>
// or accessToken cookie

// Response 200
{ "data": { "user": { ... } } }
```

#### POST `/auth/otp/request`

```json
{ "phone": "+919876543210" }
// Response 200
{ "data": { "message": "OTP sent to your phone number" } }
```

> In `development` the OTP is printed to the server console instead of being sent.

#### POST `/auth/otp/verify`

```json
{ "phone": "+919876543210", "otp": "123456" }
// Response 200 — same shape as login (user + tokens)
```

---

### Appointments — `/appointments` _(Steps 7–11)_

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/appointments` | ✓ | any | List user's appointments (role-scoped) |
| POST | `/appointments` | ✓ | PATIENT | Book a new appointment |
| GET | `/appointments/:id` | ✓ | any | Get single appointment |
| GET | `/appointments/:id/meet` | ✓ | any | Get Meet link for an appointment |
| PATCH | `/appointments/:id/reschedule` | ✓ | PATIENT | Reschedule (patches Google event) |
| PATCH | `/appointments/:id/cancel` | ✓ | PATIENT/DOCTOR | Cancel (deletes Google event) |
| PATCH | `/appointments/:id/confirm` | ✓ | DOCTOR/ADMIN | Confirm (creates Google Meet event) |
| PATCH | `/appointments/:id/complete` | ✓ | DOCTOR/ADMIN | Mark completed |
| PATCH | `/appointments/:id/no-show` | ✓ | DOCTOR/ADMIN | Mark no-show |

### Admin — `/admin` _(Step 10)_

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/admin/stats` | ✓ | DOCTOR/ADMIN | Dashboard analytics |
| GET/POST/PATCH/DELETE | `/admin/availability-rules` | ✓ | DOCTOR/ADMIN | Availability rule CRUD |
| GET/POST/DELETE | `/admin/blocked-dates` | ✓ | DOCTOR/ADMIN | Blocked dates CRUD |
| GET | `/admin/patients` | ✓ | DOCTOR/ADMIN | Patient list with history |

### Google Calendar — `/google` _(Step 11)_

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/google/auth-url` | ✓ | DOCTOR/ADMIN | Get OAuth consent URL |
| GET | `/google/status` | ✓ | DOCTOR/ADMIN | Check if Google Calendar is connected |
| GET | `/google/callback` | None | — | OAuth2 redirect handler (called by Google) |

---

### Availability / Slots — `/slots` _(Step 7)_

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/slots` | None | — | Get available slots for a date |
| GET | `/availability` | None | — | Get doctor's weekly availability rules |
| PUT | `/availability` | ✓ | DOCTOR/ADMIN | Update availability rules |
| POST | `/availability/block` | ✓ | DOCTOR/ADMIN | Block specific dates |

---

### Payments — `/payments` _(Step 11)_

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/payments/order` | ✓ | PATIENT | Create Razorpay order |
| POST | `/payments/verify` | ✓ | PATIENT | Verify Razorpay signature |
| POST | `/webhooks/razorpay` | None | — | Razorpay webhook (HMAC-verified) |

---

## Error Responses

All errors follow a consistent shape:

```json
{ "error": "Human-readable message", "code": "MACHINE_READABLE_CODE" }
```

For validation errors:

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": { "email": "Invalid email address", "password": "Too short" }
}
```

### Common error codes

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Zod schema validation failed |
| `UNAUTHENTICATED` | 401 | Missing / expired token |
| `TOKEN_EXPIRED` | 401 | JWT verification failed |
| `FORBIDDEN` | 403 | Insufficient role |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE_ENTRY` | 409 | Unique constraint violated |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Security

- **Helmet** sets security headers (CSP, HSTS, X-Frame-Options…)
- **CORS** restricts origins to `CORS_ORIGINS` only
- **Rate limiting** on all auth routes via `express-rate-limit`
- **httpOnly cookies** prevent client-side token theft
- **bcrypt** (cost 12) for password hashing
- **Zod** validation on every mutating endpoint
- **Audit log** written for every successful mutation (actor, action, entity, IP)
- **HTTPS** enforced via Helmet HSTS + `trust proxy` in production

---

## Architecture

```
apps/api/src/
├── config/           # Typed env config
├── middleware/
│   ├── auditLog.ts   # writeAuditLog() + auto middleware
│   ├── errorHandler.ts  # AppError class + global handler
│   ├── requireAuth.ts   # JWT verification
│   ├── requireRole.ts   # RBAC
│   └── validate.ts      # Zod body/query/params validation
├── modules/
│   └── auth/            # register, login, refresh, logout, me, OTP
│       ├── auth.controller.ts
│       ├── auth.router.ts
│       └── auth.service.ts
├── prisma/
│   ├── schema.prisma    # 8-model schema
│   ├── seed.ts
│   └── migrations/
├── types/
│   └── express.d.ts     # Request.user augmentation
├── utils/
│   ├── jwt.ts           # sign / verify helpers
│   ├── logger.ts        # console logger
│   └── prisma.ts        # PrismaClient singleton
└── index.ts             # Express app entry point
```
