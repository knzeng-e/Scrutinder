# Scrutinder — Backlog

> **Read before starting any task.** Mark tasks 🟡 when you begin, ✅ when done.
> One task in progress at a time per agent. See [AGENTS.md](AGENTS.md) for agent roles.

## Status legend

| Symbol | Meaning |
|---|---|
| 🔵 | TODO — not started |
| 🟡 | IN PROGRESS |
| ✅ | DONE |
| 🔴 | BLOCKED — note reason inline |
| ⏸️ | DEFERRED — intentionally postponed |

---

## Phase 1 — Next.js Foundation
**Goal:** Feature parity with the Vite/Node.js prototype (`../swipe_app`), with persistent DB and proper server-side WebAuthn verification.
**Status:** 🟡 IN PROGRESS

### 1.1 Project scaffold & config
- ✅ `CLAUDE.md` — project context, commands, invariants
- ✅ `BACKLOG.md` — this file
- ✅ `AGENTS.md` — agentic architecture
- ✅ `package.json` — Next.js 15, Prisma, Framer Motion, simplewebauthn, Zod
- ✅ `next.config.ts`
- ✅ `tsconfig.json`
- ✅ `tailwind.config.ts`
- ✅ `postcss.config.mjs`
- ✅ `.env.example`
- ✅ `.gitignore`

### 1.2 Data layer
- ✅ `prisma/schema.prisma` — Vote, WebAuthnCredential, WebAuthnChallenge
- ✅ `types/index.ts` — shared TypeScript types
- ✅ `lib/db.ts` — Prisma singleton
- ✅ `lib/measures.ts` — static data loader
- ✅ `lib/crypto.ts` — SHA-256 vote hash
- ✅ `data/measures.json` — migrated from prototype
- ✅ `data/program.json` — migrated from prototype
- ✅ `public/images/` — measure + chapter images migrated

### 1.3 Identity & auth
- ✅ `lib/identity.client.ts` — localStorage + AES-GCM (browser only)
- ✅ `lib/identity.server.ts` — @simplewebauthn/server helpers
- ✅ `context/IdentityContext.tsx` — global auth state
- ✅ `app/api/auth/register/generate-options/route.ts`
- ✅ `app/api/auth/register/verify/route.ts`
- ✅ `app/api/auth/authenticate/generate-options/route.ts`
- ✅ `app/api/auth/authenticate/verify/route.ts`

### 1.4 API routes
- ✅ `app/api/measures/route.ts`
- ✅ `app/api/program/route.ts`
- ✅ `app/api/vote/route.ts`
- ✅ `app/api/vote/undo/route.ts`
- ✅ `app/api/results/route.ts`

### 1.5 App shell & pages
- ✅ `app/layout.tsx` + `app/globals.css`
- ✅ `app/page.tsx` — home / onboarding / dashboard
- ✅ `app/swipe/page.tsx`
- ✅ `app/programme/page.tsx`
- ✅ `app/resultats/page.tsx`

### 1.6 Components
- ✅ `components/AppShell.tsx` — header + nav wrapper
- ✅ `components/IdentityGate.tsx` — passkey create/unlock UI
- ✅ `components/SwipeDeck.tsx` — Framer Motion swipe deck
- ✅ `components/ActionBar.tsx` — vote buttons
- ✅ `components/ProgramReader.tsx` — chapter browser + detail
- ✅ `components/ResultsDashboard.tsx` — stats + sortable table

### 1.7 Validation (manual)
- 🔵 Run `npm install` — zero errors
- 🔵 Run `npm run db:generate` — Prisma client generated
- 🔵 Run `npm run db:push` — schema applied to Neon
- 🔵 `npm run dev` starts without errors
- 🔵 Passkey creation works on `localhost` (Chrome/Safari)
- 🔵 Passkey unlock works on same device
- 🔵 Swipe → vote row appears in `Vote` table (check Prisma Studio)
- 🔵 Undo → vote row deleted
- 🔵 Results page shows correct counts
- 🔵 Program reader shows all 18 chapters

---

## Phase 2 — UX Polish
**Goal:** Production-quality UX, accessibility, PWA.
**Start when:** All Phase 1 validation tasks are ✅

- 🔵 Framer Motion swipe velocity + spring physics tuning
- 🔵 Mobile safe-area insets (iOS Safari notch, `env(safe-area-inset-*)`)
- 🔵 PWA: `public/manifest.json` + service worker (`next-pwa`)
- 🔵 OG share card for results page (`opengraph-image.tsx`)
- 🔵 Keyboard navigation: arrow keys to vote while focused on deck
- 🔵 Measure images with `next/image` (lazy load, blur placeholder)
- 🔵 Account panel: view vote history, change pseudonym, delete profile
- 🔵 Loading skeletons for async data fetches
- 🔵 Dark/light theme toggle (respects `prefers-color-scheme`)
- 🔵 Rate-limit `/api/vote` (1 vote per voterId per measureId per session)
- 🔵 Shadcn/ui integration for dialogs, toasts, buttons

---

## Phase 3 — Community Features
**Goal:** Discussion spaces for debated measures + contribution box.
**Start when:** Phase 2 is complete and app is deployed.

- 🔵 Discussion threads per measure (stored in DB, sorted by `discuter` count)
- 🔵 Idea/contribution submission form per measure
- 🔵 Admin dashboard (password-protected): top debated measures, CSV export
- 🔵 Shareable vote session summary card (Canvas API → PNG download)
- 🔵 Citoyen café event relay: groups can pin meetups on a measure page

---

## Phase 4 — Production Deployment
**Goal:** Live, secure, monitored on Vercel + Neon.
**Start when:** Phase 3 features are stable (or skip Phase 3 and deploy after Phase 2).

- 🔵 Vercel project created + GitHub repo connected
- 🔵 Neon PostgreSQL provisioned, `DATABASE_URL` set in Vercel env
- 🔵 Custom domain (e.g. `scrutinder.fr`) + HTTPS enforced
- 🔵 `WEBAUTHN_RP_ID` + `WEBAUTHN_ORIGIN` set to production values
- 🔵 Sentry error tracking (`@sentry/nextjs`)
- 🔵 Vercel Analytics enabled
- 🔵 Smoke test: iOS Safari + Chrome Android — WebAuthn must work
- 🔵 Load test: 500 concurrent voters
- 🔵 `prisma migrate deploy` run for production migration

---

## Phase 5 — Web3 Transparency Layer ⏸️ DEFERRED
**Goal:** Anchor vote aggregates on Polkadot Bulletin Chain for public verifiability.
**Deferred until:** Strong user base established post Phase 4.

- ⏸️ `@parity/bulletin-sdk` integration
- ⏸️ Hourly vote snapshot → CID published on Bulletin Chain
- ⏸️ `/verifier` page: fetch chain state, compare with live DB
- ⏸️ Optional identity upgrade: link passkey to Polkadot address

---

## Current focus
**Phase 1.7 Validation** — set up `.env.local`, run `npm install && npm run db:generate && npm run db:push`, then validate manually.
