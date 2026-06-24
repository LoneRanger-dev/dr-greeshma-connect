# Dr. Greeshma Connect — Step-by-Step Build Prompts

A complete, ordered set of copy-paste prompts for **Claude / GitHub Copilot Chat inside VS Code**.
Run them **in order**. Wait for each step to finish, review the files it creates, then paste the next one.

> **Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · ShadCN UI · Framer Motion · React Three Fiber (3D) · Node/Express · Prisma · PostgreSQL (Supabase) · NextAuth · Razorpay · Google Calendar/Meet.

---

## How to use this file

1. Open the **integrated terminal** and your project folder in VS Code.
2. Open the AI chat panel (Copilot Chat / Claude). Set it to **Agent mode** so it can create files and run commands.
3. Copy **one prompt block at a time** (everything inside the grey box), paste, and let it complete.
4. After each step, run the dev server and confirm it works before moving on.
5. Keep a `.env.local` open — several steps add keys to it.

**Golden rule for every prompt:** the agent should *create real files*, use **TypeScript**, **Tailwind v4**, and keep everything **mobile-first, accessible (WCAG AA), and animated**.

---

## STEP 0 — Project scaffold & folder structure

```
You are my senior full-stack engineer. We are building "Dr. Greeshma Connect", a premium,
mobile-first telehealth booking platform for an OB-GYN. We use a MONOREPO with two apps:
a Next.js 15 frontend and a Node/Express + Prisma backend.

Create the complete folder structure and scaffold below. Use TypeScript everywhere.
Initialize git. Create a root README.md describing the architecture.

Target structure:

dr-greeshma-connect/
├─ apps/
│  ├─ web/                     # Next.js 15 (App Router) frontend
│  │  ├─ src/
│  │  │  ├─ app/               # routes
│  │  │  │  ├─ (marketing)/    # landing, about, services
│  │  │  │  ├─ (booking)/      # booking flow
│  │  │  │  ├─ admin/          # doctor portal (protected)
│  │  │  │  ├─ api/            # next route handlers (auth, webhooks)
│  │  │  │  └─ layout.tsx
│  │  │  ├─ components/        # ui/, sections/, three/, shared/
│  │  │  ├─ lib/               # api client, utils, validators (zod)
│  │  │  ├─ hooks/
│  │  │  ├─ styles/            # globals.css, theme tokens
│  │  │  └─ types/
│  │  └─ public/
│  └─ api/                     # Express backend
│     ├─ src/
│     │  ├─ modules/           # auth, appointments, slots, payments, notifications, google
│     │  ├─ middleware/        # jwt, rbac, audit, error
│     │  ├─ prisma/            # schema.prisma, seed.ts
│     │  ├─ config/
│     │  ├─ utils/
│     │  └─ index.ts
│     └─ package.json
├─ packages/
│  └─ shared/                  # shared TS types & zod schemas used by web + api
├─ .env.example
├─ .gitignore
├─ package.json                # workspaces root
└─ README.md

Steps:
1. Create the folders and placeholder files above.
2. Set up npm/pnpm workspaces in the root package.json.
3. Add a thorough .gitignore (node_modules, .env*, .next, dist, prisma/migrations cache).
4. Create .env.example with EVERY env var we'll need (DB, NextAuth, Google, Razorpay,
   SMTP, WhatsApp) with placeholder values and inline comments.
5. Write README.md with: overview, stack, folder map, and "how to run" commands.

Do not write feature code yet. Just scaffold cleanly and confirm the tree.
```

---

## STEP 1 — Initialize the Next.js 15 frontend

```
In apps/web, initialize a Next.js 15 app (App Router, TypeScript, ESLint, src dir,
import alias @/*). Then install and configure:
- Tailwind CSS v4 (with @theme tokens in globals.css)
- ShadCN UI (init, New York style, slate base, CSS variables on)
- Framer Motion
- lucide-react icons
- zod + react-hook-form + @hookform/resolvers
- @tanstack/react-query for data fetching
- clsx + tailwind-merge (cn helper in lib/utils.ts)

Configure:
- app/layout.tsx with <html lang="en">, a font (Inter + a display font like "Fraunces"
  or "Sora"), QueryClient provider, and a ThemeProvider.
- A global error boundary and loading.tsx.
- Confirm `npm run dev` boots with no errors.

Make the base layout mobile-first and accessible (skip-to-content link, proper landmarks).
```

---

## STEP 2 — Design system: "magical hospital" theme & tokens

```
Build our premium design system in apps/web. Theme = "calm magical clinic": soft medical
trust + a subtle enchanted/aurora feel. NOT childish — elegant and premium.

1. In styles/globals.css define Tailwind v4 @theme tokens:
   - Palette: primary teal/emerald (#0EA5A4 family), secondary soft violet (#7C6CF0),
     accent rose-gold (#E8B4B8), neutrals (slate), success/warn/error.
   - Gradients: --gradient-aurora (teal→violet→rose), --gradient-glass, --gradient-hero.
   - Radii (xl/2xl/3xl), shadows incl. a soft "glow" shadow, and motion easing tokens.
   - Support light AND dark mode via CSS variables.
2. Create components/ui primitives (extend ShadCN): Button, Card, Badge, Input, Select,
   Dialog, Sheet, Tabs, Calendar, Toast, Skeleton.
3. Create a reusable <MagicButton> with: gradient fill, animated sheen on hover, a soft
   glow, micro press-scale, and a ripple. Must be keyboard-focusable with visible focus ring.
4. Create <GlassCard> (glassmorphism) and <AuroraBackground> (animated gradient blobs using
   CSS + Framer Motion, respecting prefers-reduced-motion).
5. Add a /styleguide route rendering every primitive so I can visually QA.

Accessibility: AA contrast, focus-visible rings, reduced-motion fallbacks everywhere.
```

---

## STEP 3 — Landing page (hero with 3D)

```
Build the marketing landing page at app/(marketing)/page.tsx for Dr. Greeshma Gopinath,
Obstetrician & Gynecologist. Mobile-first, premium, animated.

Sections (each its own component in components/sections):
1. Sticky glass navbar: logo, links (Home, About, Services, Timings, Book), and a
   <MagicButton> "Book Appointment". Mobile hamburger -> Sheet.
2. HERO: split layout. Left = headline, subcopy, two CTAs. Right = a 3D scene
   (React Three Fiber): a softly rotating abstract "aurora orb"/floating particles with
   gentle bloom. Lazy-load the 3D canvas, fallback to a gradient image, and disable on
   prefers-reduced-motion. Add the @react-three/fiber + @react-three/drei deps.
3. Trust strip: stats (years experience, patients, rating) with count-up animation.
4. Services preview grid (5 cards, see Step 4).
5. "Why choose" features with scroll-reveal (Framer Motion whileInView).
6. Testimonials carousel.
7. CTA band with aurora background.
8. Footer: contact, hours, socials, copyright.

All buttons use MagicButton with hover sheen + glow. Animate section entrances with
staggered fade-up. Keep Lighthouse-friendly: lazy 3D, next/image, no layout shift.
```

---

## STEP 4 — Doctor profile & services pages

```
Build two marketing pages.

A) About / Doctor profile at app/(marketing)/about/page.tsx:
   - Portrait card (GlassCard) with name, qualifications, registration, and a short bio.
   - Achievements timeline (animated vertical timeline).
   - Specialties chips, languages, hospital affiliations.

B) Services at app/(marketing)/services/page.tsx + a dynamic detail route
   app/(marketing)/services/[slug]/page.tsx. Create a data file lib/services.ts with these
   5 services (slug, title, icon, summary, what's-included, duration, price ₹):
     1. Pregnancy Consultation
     2. PCOS / PCOD Consultation
     3. Infertility Consultation
     4. Post-Delivery Care
     5. General Gynecology Consultation
   - Grid of animated service cards linking to detail pages.
   - Each detail page: hero, description, what to expect, FAQ accordion, and a
     "Book this consultation" MagicButton that deep-links to the booking flow with the
     service preselected (?service=slug).

SEO: add metadata for each page. Keep it accessible and mobile-first.
```

---

## STEP 5 — Database schema (Prisma + PostgreSQL)

```
In apps/api, set up the backend foundation:
1. Initialize Express + TypeScript (ts-node-dev, tsconfig, eslint).
2. Add Prisma with a PostgreSQL datasource (DATABASE_URL from env, Supabase-compatible).
3. Design prisma/schema.prisma with these models:

   - User        (id, name, email unique, phone, passwordHash?, role enum[PATIENT,DOCTOR,ADMIN],
                  emailVerified, createdAt)
   - DoctorProfile (id, userId unique, bio, specialties[], consultFeeDefault)
   - Service     (id, slug unique, title, description, durationMin, priceInr, isActive)
   - AvailabilityRule (id, doctorId, weekday, startTime, endTime, slotIntervalMin
                  enum[10,15,30,60], isRecurring, validFrom, validTo)
   - BlockedDate (id, doctorId, date, reason)   // vacations
   - Appointment (id, patientId, serviceId, doctorId, startsAt, endsAt, status
                  enum[PENDING,CONFIRMED,RESCHEDULED,CANCELLED,COMPLETED,NO_SHOW],
                  meetLink, googleEventId, amountInr, createdAt, updatedAt)
                  -> add a UNIQUE constraint on (doctorId, startsAt) to PREVENT DOUBLE BOOKING.
   - Payment     (id, appointmentId unique, razorpayOrderId, razorpayPaymentId, status
                  enum[CREATED,PAID,FAILED,REFUNDED], amountInr, createdAt)
   - Notification(id, appointmentId, channel enum[EMAIL,WHATSAPP,SMS], status, sentAt)
   - AuditLog    (id, actorId, action, entity, entityId, metadata Json, createdAt)

4. Add sensible indexes. Run `prisma migrate dev --name init`.
5. Create prisma/seed.ts: seed the doctor user, the 5 services, and a default weekly
   availability rule. Add an npm "seed" script.
6. Mirror these as zod schemas + TS types in packages/shared so web and api stay in sync.
```

---

## STEP 6 — Backend API: auth, RBAC, audit

```
In apps/api build the auth + security layer:
1. JWT auth (access + refresh tokens, httpOnly cookies). Endpoints:
   POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout,
   GET /auth/me. Hash passwords with bcrypt. Validate bodies with the shared zod schemas.
2. Optional OTP login: POST /auth/otp/request, POST /auth/otp/verify (stub the SMS sender).
3. Middleware:
   - requireAuth (verifies JWT)
   - requireRole(...roles) for RBAC -> only DOCTOR/ADMIN can modify schedules.
   - auditLog middleware that writes an AuditLog row for every mutating request.
   - centralized error handler + zod validation error formatting.
4. Security: helmet, cors (allow only the web origin), rate-limiting on auth routes,
   and force HTTPS notes for production.
5. Add a health check GET /health. Write a README in apps/api documenting every route.
```

---

## STEP 7 — Scheduling engine (slots + no double booking)

```
Implement the scheduling engine in apps/api (modules/slots and modules/appointments).

Slot generation rules:
- Configurable interval: 10 / 15 / 30 / 60 minutes (from AvailabilityRule.slotIntervalMin).
- Booking window: from (now rounded up to next slot) up to 30 days ahead.
- Generate slots from the doctor's AvailabilityRules for the weekday, then SUBTRACT:
    (a) BlockedDate vacation days, (b) already-booked Appointment start times.
- Return only future, free slots. Handle the IST timezone correctly (store UTC).

Endpoints:
- GET  /slots?serviceId=&date=         -> available slots for a day
- GET  /slots/availability?from=&to=   -> which days have any availability (for calendar dots)
- POST /appointments                   -> book a slot. Wrap in a DB transaction and rely on
       the UNIQUE(doctorId, startsAt) constraint; on conflict return 409 "slot just taken".
- PATCH /appointments/:id/reschedule   -> move to a new free slot (re-check availability).
- PATCH /appointments/:id/cancel       -> cancel (patient or doctor), free the slot.
- GET  /appointments (role-aware: patient sees own, doctor sees all, with filters).

Write unit tests for slot generation and the double-booking guard (Vitest/Jest).
```

---

## STEP 8 — Booking flow UI (frontend)

```
Build the patient booking flow in apps/web at app/(booking)/book/page.tsx as a polished
multi-step wizard (Framer Motion step transitions). Use React Query to call the api.

Steps:
1. Choose service (preselect from ?service= query). Animated cards.
2. Pick a date: a custom <BookingCalendar> (ShadCN Calendar) showing only the next 30 days,
   with a glowing dot on days that have availability (GET /slots/availability).
3. Pick a time: fetch GET /slots for the chosen day, render slot chips in a responsive grid;
   selected chip glows. Show "fully booked" empty state nicely. Poll/refetch so taken slots
   disappear in near real-time.
4. Patient details form (name, email, phone) with react-hook-form + zod inline validation.
5. Review & confirm -> proceed to payment (Step 11).

Add a sticky summary panel (service, date, time, fee). Every action button is a MagicButton
with hover sheen. Handle the 409 "slot just taken" error with a friendly toast + auto-refresh.
Fully mobile-first; the wizard becomes a bottom-sheet style on small screens.
```

---

## STEP 9 — NextAuth + connecting frontend auth

```
Wire authentication in apps/web using NextAuth (Auth.js) v5:
1. Configure providers: Credentials (calls our Express /auth/login) AND Google OAuth.
2. Store the backend JWT in the NextAuth session; attach it as a Bearer token in the
   React Query api client (lib/api.ts) for protected calls.
3. Create app/(auth)/login and /register pages with our premium GlassCard forms, MagicButton
   submit, error states, and Google sign-in button.
4. Protect /admin/** with middleware.ts -> redirect unauthenticated or non-DOCTOR users to
   /login. Show a role-aware navbar (Book vs. Admin Dashboard).
5. Add sign-out and a profile menu.

Keep tokens in httpOnly cookies; never expose secrets to the client bundle.
```

---

## STEP 10 — Doctor admin portal + analytics dashboard

```
Build the protected doctor portal under app/admin (sidebar layout, glass theme, dark-mode aware).

Pages:
1. /admin (Dashboard): analytics cards (today's appointments, week revenue ₹, upcoming,
   cancellations) with count-up + sparkline. A revenue line chart and an appointments-by-
   service donut (use recharts). A "next appointments" list with join-Meet buttons.
2. /admin/appointments: filterable, sortable table (status, date, service). Row actions:
   confirm, reschedule, cancel, mark completed/no-show, copy Meet link, view patient details.
3. /admin/availability: manage AvailabilityRules — set weekday windows, choose slot interval
   (10/15/30/60), create recurring schedules, and modify timings. Visual weekly grid.
4. /admin/vacations: block dates (calendar multi-select) -> writes BlockedDate.
5. /admin/patients: searchable list with appointment history.

All mutations call the role-protected api endpoints and show optimistic UI + toasts.
Only DOCTOR/ADMIN can load these pages. Make tables responsive (cards on mobile).
```

---

## STEP 11 — Google Calendar + Meet integration

```
In apps/api add modules/google for Google Calendar + Meet:
1. Use googleapis with a service account OR OAuth2 (doctor connects once). Store refresh
   token securely. Document the Google Cloud setup (enable Calendar API, create credentials)
   in apps/api/README.
2. On successful, PAID appointment booking:
   - Create a Google Calendar event for the doctor with the patient as attendee.
   - Set conferenceData to auto-generate a Google Meet link (conferenceDataVersion=1).
   - Save googleEventId + meetLink on the Appointment.
3. On reschedule -> patch the event time. On cancel -> delete the event.
4. Expose GET /appointments/:id/meet to return the link; surface it in admin + confirmation.
Handle token refresh and API errors gracefully; never block booking if Google is down
(queue/retry and still confirm the appointment).
```

---

## STEP 12 — Razorpay payments

```
Add payments (apps/api modules/payments + apps/web checkout step):
1. Backend:
   - POST /payments/order -> create a Razorpay order for the service fee (amount in paise),
     return order id + key id.
   - POST /payments/verify -> verify the Razorpay signature (HMAC SHA256), on success mark
     Payment PAID and Appointment CONFIRMED, then trigger Google Meet creation (Step 11)
     and notifications (Step 13).
   - POST /webhooks/razorpay -> handle payment.captured / failed / refund events (verify
     webhook signature). Idempotent.
2. Frontend (Step 8 review screen): load Razorpay checkout.js, open checkout with the order,
   and on success call /payments/verify, then route to a success page showing the Meet link,
   date/time, and an "Add to Calendar" button.
3. Handle failure/cancel: keep appointment PENDING, free the slot if not paid within N minutes.
Put RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET / webhook secret in env. Test mode first.
```

---

## STEP 13 — Email + WhatsApp notifications

```
Add modules/notifications in apps/api:
1. Email via Nodemailer (SMTP / Gmail). Build branded HTML templates (premium, on-theme) for:
   booking confirmation (with Meet link + date/time), reschedule, cancellation, and a
   24h reminder.
2. WhatsApp via WhatsApp Business Cloud API (Meta). Send confirmation + reminder messages
   using approved templates. Provide an SMS fallback stub (Twilio) behind the same interface.
3. A simple reminder scheduler (node-cron): every 15 min, find appointments starting in ~24h
   and ~1h without a sent reminder, send them, and log a Notification row.
4. Make a NotificationService with one send(channel, type, appointment) interface so callers
   don't care about provider details. Log every send to the Notification table.
Document all env vars (SMTP_*, WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, template names).
```

---

## STEP 14 — 3D & motion polish pass

```
Do a "magical premium" polish pass across apps/web without hurting performance:
1. Hero 3D (R3F): refine the aurora orb/particles — soft bloom, parallax on pointer move,
   gentle float. Lazy-load via dynamic import (ssr:false) and Suspense; static gradient
   fallback. Fully disabled under prefers-reduced-motion.
2. Add page transition animations (Framer Motion) between routes.
3. Micro-interactions: MagicButton sheen + ripple, card tilt-on-hover (subtle), animated
   gradient borders on key CTAs, scroll-reveal for all sections, count-up stats.
4. Add a tasteful cursor glow / aurora trail only on desktop pointers.
5. Verify: no CLS, lazy media, Lighthouse performance >= 90 mobile, AA contrast,
   keyboard nav works, and ALL motion respects reduced-motion. Fix anything that fails.
```

---

## STEP 15 — Testing & hardening

```
Add a testing + hardening pass:
1. Backend: Vitest/Jest unit tests for slot generation, double-booking guard, JWT/RBAC,
   and Razorpay signature verification. Supertest for key endpoints.
2. Frontend: Vitest + React Testing Library for the booking wizard and form validation.
   One Playwright e2e happy path: pick service -> date -> slot -> details -> (mock) pay ->
   confirmation shows Meet link.
3. Security review: rate limits, input validation everywhere (zod), CORS locked to the web
   origin, secrets only server-side, audit logs on mutations, and HTTPS-only cookies in prod.
4. Add GitHub Actions CI: install, lint, typecheck, test on push.
Report a checklist of what passed/failed and fix failures.
```

---

## STEP 16 — Deployment & docs

```
Prepare production deployment and write the docs.

Targets: Frontend -> Vercel, Backend -> Render (or Railway), DB -> Supabase PostgreSQL.

1. Supabase: create the project, get the pooled DATABASE_URL, run `prisma migrate deploy`
   and `prisma db seed`. Document steps.
2. Backend on Render: add a render.yaml (or Dockerfile), build/start commands, env vars,
   health check path /health, and run migrations on deploy.
3. Frontend on Vercel: set all NEXT_PUBLIC_* and server env vars, set the API base URL,
   configure the Google OAuth redirect URIs and Razorpay/WhatsApp webhook URLs to the
   live domains.
4. Write DEPLOYMENT.md covering: prerequisites, every env var (table: name | where | example),
   first-deploy order, how to rotate secrets, and a smoke-test checklist.
5. Update root README with live URLs, architecture diagram (mermaid), and "run locally" steps.

Finish with a go-live checklist: HTTPS, webhooks verified, test booking end-to-end in prod
test mode, reminders firing, and admin login working.
```

---

## Quick reference — run order

| # | Prompt | Produces |
|---|--------|----------|
| 0 | Scaffold | Monorepo folders, env.example, README |
| 1 | Next.js init | Frontend app + deps |
| 2 | Design system | Theme tokens, MagicButton, GlassCard, styleguide |
| 3 | Landing page | Hero (3D) + all sections |
| 4 | Profile & services | About + 5 service pages |
| 5 | Prisma schema | DB models + seed |
| 6 | Auth & RBAC | JWT, roles, audit, security |
| 7 | Scheduling engine | Slot logic + no double booking |
| 8 | Booking flow | Patient wizard UI |
| 9 | NextAuth | Login/register + protected routes |
| 10 | Admin portal | Dashboard, appointments, availability, vacations |
| 11 | Google Calendar/Meet | Auto Meet links + calendar sync |
| 12 | Razorpay | Orders, verify, webhooks |
| 13 | Notifications | Email + WhatsApp + reminders |
| 14 | 3D/motion polish | Magical premium pass |
| 15 | Testing | Unit/e2e + security |
| 16 | Deploy | Vercel + Render + Supabase + docs |

---

### Tips for driving the agent in VS Code
- Run prompts **one at a time**; review the created files before the next.
- If a step is large, tell the agent: *"do this in parts, file by file, and pause after each."*
- Keep `.env.local` (web) and `.env` (api) updated as steps add keys.
- After Steps 1, 5, 8 — run the app and confirm before continuing.
- If something breaks, paste the error and say *"fix this, then continue the current step."*
