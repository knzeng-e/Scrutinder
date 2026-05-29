# AGENTS.md — Scrutinder Agentic Architecture

> This file defines how AI agents navigate and contribute to Scrutinder.
> **Always read [BACKLOG.md](BACKLOG.md) first** to find open tasks and understand current phase.
> **Always read [CLAUDE.md](CLAUDE.md) first** for project commands and invariants.

---

## Entry protocol for every agent

1. Read `BACKLOG.md` → find the current phase and open 🔵 tasks in your scope
2. Read `CLAUDE.md` → check commands and invariants
3. Mark the task 🟡 IN PROGRESS in `BACKLOG.md` before touching code
4. Implement within your scope (see roles below)
5. Mark the task ✅ DONE in `BACKLOG.md` when complete
6. If something non-obvious was discovered, update memory or add a note to BACKLOG.md

---

## Agent roles

### `frontend-agent`
**Scope:** `app/**/*.tsx` (pages), `components/**/*.tsx`, `app/globals.css`, `tailwind.config.ts`
**Responsibilities:** React components, Tailwind styling, Framer Motion animations, responsive layout
**Reads:** `types/index.ts`, `context/IdentityContext.tsx` (consume only, don't modify)
**Never touches:** `lib/identity.server.ts`, `prisma/`, API route handlers, `lib/db.ts`
**Key patterns:**
- All interactive components must be `'use client'`
- Server components may only be used for pages that pass static data as props
- Use `useIdentity()` hook for auth state — never read localStorage directly in components

### `backend-agent`
**Scope:** `app/api/**/*.ts` (excluding `/api/auth`), `lib/db.ts`, `lib/measures.ts`, `lib/crypto.ts`, `prisma/schema.prisma`
**Responsibilities:** API route handlers, DB schema, vote counting, result hashing
**Key patterns:**
- Every POST route validates input with Zod before any DB call
- Never return raw Prisma errors to the client
- Use the singleton from `lib/db.ts` — never `new PrismaClient()`
- `Vote.choice` is an enum: `pour | contre | discuter | prioritaire | incompris` — no additions without a migration

### `auth-agent`
**Scope:** `lib/identity.client.ts`, `lib/identity.server.ts`, `context/IdentityContext.tsx`, `app/api/auth/**/*.ts`
**Responsibilities:** WebAuthn passkey flows, AES-GCM vote encryption, identity lifecycle
**Critical invariants:**
- `identity.seed` is generated browser-side and stored only in `localStorage` — **it must never be sent to the server**
- WebAuthn challenges expire in 60 seconds — clean up expired ones on each request
- `WEBAUTHN_RP_ID` must match the origin exactly: `localhost` in dev, real domain in prod
- On passkey creation, `sc_<hex32>` is derived from `sha256(seed)` — this is stable and deterministic

### `data-agent`
**Scope:** `data/measures.json`, `data/program.json`, `scripts/` (future sync scripts)
**Responsibilities:** Keeping measure and program data up to date
**Critical invariant:** `id` values in `measures.json` are integer FK references in the `Vote` table — **never renumber or reuse IDs** if a measure is removed, leave a gap or mark deprecated

### `devops-agent`
**Scope:** `vercel.json`, `.github/workflows/`, `prisma/migrations/`, environment config
**Responsibilities:** Deployment pipeline, CI/CD, monitoring setup, migration management
**Key tasks:** Phase 4 items in BACKLOG.md
**Important:** Use `prisma migrate deploy` (not `db push`) in production

---

## File map

```
scrutinder/
├── CLAUDE.md              ← Commands, architecture, invariants (READ FIRST)
├── BACKLOG.md             ← Task state (UPDATE as you work)
├── AGENTS.md              ← This file — agent roles and coordination
│
├── app/
│   ├── layout.tsx         ← Root layout: fonts, metadata, IdentityProvider wrapper
│   ├── globals.css        ← Tailwind directives + CSS custom properties
│   ├── page.tsx           ← Home: delegates to IdentityGate or dashboard
│   ├── swipe/
│   │   └── page.tsx       ← Passes measures[] to SwipeDeck (server → client)
│   ├── programme/
│   │   └── page.tsx       ← Passes program[] to ProgramReader (server → client)
│   ├── resultats/
│   │   └── page.tsx       ← Fetches results from DB server-side, passes to ResultsDashboard
│   └── api/
│       ├── auth/
│       │   ├── register/generate-options/route.ts
│       │   ├── register/verify/route.ts
│       │   ├── authenticate/generate-options/route.ts
│       │   └── authenticate/verify/route.ts
│       ├── measures/route.ts
│       ├── program/route.ts
│       ├── vote/route.ts
│       ├── vote/undo/route.ts
│       └── results/route.ts
│
├── components/
│   ├── AppShell.tsx       ← Header + nav (brand, identity button, nav links)
│   ├── IdentityGate.tsx   ← Passkey create / unlock UI
│   ├── SwipeDeck.tsx      ← Framer Motion swipe deck + card detail modal
│   ├── ActionBar.tsx      ← Vote buttons (contre, incompris, pour, prioritaire, undo)
│   ├── ProgramReader.tsx  ← Chapter grid + ChapterDetail view
│   └── ResultsDashboard.tsx ← Stats cards + sortable measures table
│
├── context/
│   └── IdentityContext.tsx ← Auth state machine, passkey calls, identity lifecycle
│
├── lib/
│   ├── db.ts              ← Prisma singleton (import this, never new PrismaClient)
│   ├── measures.ts        ← Typed static loaders for measures.json + program.json
│   ├── crypto.ts          ← computeVoteHash(votes) → SHA-256 hex string
│   ├── identity.client.ts ← Browser: localStorage identity, AES-GCM, @simplewebauthn/browser
│   └── identity.server.ts ← Server: @simplewebauthn/server registration + auth helpers
│
├── types/
│   └── index.ts           ← Measure, ProgramChapter, Identity, VoteChoice, ResultsData, etc.
│
├── data/
│   ├── measures.json      ← Political measures (stable integer IDs — never renumber!)
│   └── program.json       ← Programme chapters (18 entries)
│
├── prisma/
│   └── schema.prisma      ← Vote + WebAuthnCredential + WebAuthnChallenge
│
├── public/
│   └── images/            ← Measure and chapter images (migrated from ../swipe_app/public)
│
└── .env.example           ← Required env vars template
```

---

## Cross-agent communication

Agents do not communicate directly — they share state through:
1. `BACKLOG.md` — task status
2. `types/index.ts` — shared data contracts
3. `CLAUDE.md` — invariants and commands

If an agent discovers a bug or blocker outside its scope, it should:
1. Add a 🔴 BLOCKED note to the relevant task in BACKLOG.md
2. Describe the issue clearly so the responsible agent can pick it up

---

## Common patterns

### Adding a new API route
1. Create `app/api/<name>/route.ts`
2. Import Zod schema for POST body validation
3. Import `prisma` from `lib/db.ts`
4. Add the route to the route map in CLAUDE.md
5. Mark the BACKLOG.md task ✅

### Adding a new component
1. Create `components/<Name>.tsx` with `'use client'` at the top
2. Import `useIdentity()` if auth state is needed
3. Use Tailwind classes — no inline styles except for dynamic values
4. Add the component to the file map in AGENTS.md

### Modifying the DB schema
1. Edit `prisma/schema.prisma`
2. Run `npm run db:generate` to regenerate the Prisma client
3. Run `npm run db:push` (dev) or create a migration file (prod)
4. Update the schema table in CLAUDE.md if the change is significant

### Updating data files
1. Modify `data/measures.json` or `data/program.json`
2. If adding new measures, continue the integer sequence — never reuse removed IDs
3. Run `npm run db:push` if you added new measures that need pre-populated vote counters
