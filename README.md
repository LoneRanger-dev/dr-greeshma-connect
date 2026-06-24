# Dr. Greeshma Connect — Smart Telehealth Booking Platform

A premium, mobile-first telehealth booking platform for Dr. Greeshma Gopinath, Obstetrician & Gynecologist.

---

## Architecture

```
dr-greeshma-connect/
├─ apps/
│  ├─ web/        # Next.js 15 (App Router) — patient-facing UI + admin portal
│  └─ api/        # Node/Express + Prisma — REST API backend
├─ packages/
│  └─ shared/     # Shared TypeScript types and Zod schemas
├─ .env.example   # All required environment variables with comments
└─ README.md
```

### Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, ShadCN UI, Framer Motion |
| 3D | React Three Fiber, @react-three/drei |
| Forms | React Hook Form + Zod |
| Data fetching | TanStack Query (React Query) |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | NextAuth (Auth.js) v5 + JWT |
| Payments | Razorpay |
| Calendar | Google Calendar API + Google Meet |
| Notifications | Nodemailer (Email), WhatsApp Business Cloud API, Twilio (SMS fallback) |
| Deployment | Vercel (web), Render (api), Supabase (db) |

---

## How to run locally

### Prerequisites

- Node.js >= 20
- pnpm >= 9 (`npm i -g pnpm`)
- A PostgreSQL database (Supabase free tier works)

### 1. Clone & install

```bash
git clone <repo-url>
cd dr-greeshma-connect
pnpm install
```

### 2. Set environment variables

```bash
# Frontend
cp .env.example apps/web/.env.local

# Backend
cp .env.example apps/api/.env
```

Edit both files and fill in real values (see `.env.example` for descriptions).

### 3. Set up the database

```bash
cd apps/api
pnpm prisma migrate dev
pnpm seed
```

### 4. Run both apps in parallel

```bash
# From the root
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000
- API health: http://localhost:4000/health

### Individual apps

```bash
pnpm dev:web   # Next.js only
pnpm dev:api   # Express only
```

---

## Build steps

This project was scaffolded in 16 ordered steps. See `BUILD_PROMPTS.md` for the full sequence.

| Step | Feature |
|------|---------|
| 0 | Monorepo scaffold (this file) |
| 1 | Next.js 15 init + deps |
| 2 | Design system (Tailwind v4 tokens, MagicButton, GlassCard) |
| 3 | Landing page (Hero with 3D scene) |
| 4 | Doctor profile & service pages |
| 5 | Prisma schema + seed |
| 6 | Backend auth (JWT, RBAC, audit) |
| 7 | Scheduling engine (slot generation, no double booking) |
| 8 | Booking flow UI (multi-step wizard) |
| 9 | NextAuth integration |
| 10 | Admin portal (dashboard, appointments, availability) |
| 11 | Google Calendar + Meet |
| 12 | Razorpay payments |
| 13 | Email + WhatsApp notifications |
| 14 | 3D & motion polish |
| 15 | Testing & hardening |
| 16 | Deployment (Vercel + Render + Supabase) |

---

## Key design decisions

- **Monorepo with pnpm workspaces** — web and api share types from `packages/shared`
- **UTC storage** — all timestamps stored in UTC; IST conversion in the UI
- **Double-booking prevention** — DB-level `UNIQUE(doctorId, startsAt)` constraint backed by a transaction
- **Non-blocking Google integration** — if Calendar API is down, booking still confirms; event creation is retried
- **Mobile-first** — every page designed for 375px first, enhanced for desktop
