# CLAUDE.md — Scrutinder

> Swipe political measures. Measure popular support. WebAuthn + Next.js 15 + Neon PostgreSQL.
> **Read [BACKLOG.md](BACKLOG.md) for task state. Read [AGENTS.md](AGENTS.md) for agent roles.**

## App overview

Scrutinder is a Tinder-inspired civic app that lets users swipe the measures of the _L'Avenir en Commun_ political programme (LFI / Mélenchon 2027). Votes are encrypted locally (AES-GCM), aggregate counts persist in PostgreSQL, and a SHA-256 hash enables public integrity verification.

**Migrated from:** `../swipe_app` (Vite/React/plain Node.js prototype → preserved for reference)

## Commands

```bash
# Development (requires DATABASE_URL in .env.local)
npm run dev            # Next.js dev server → http://localhost:3000
npm run build          # Production build
npm start              # Production server

# Database
npm run db:push        # Push schema to Neon (no migration file created)
npm run db:generate    # Regenerate Prisma client after schema changes
npm run db:studio      # Open Prisma Studio (visual DB browser)
npm run db:migrate     # Create + apply a named migration (use in prod)

# First-time setup
cp .env.example .env.local
# Fill in DATABASE_URL, WEBAUTHN_RP_ID, WEBAUTHN_ORIGIN
npm install
npm run db:generate
npm run db:push
npm run dev
```

## Architecture

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router + TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Phase 2) |
| Animations | Framer Motion (swipe physics) |
| Auth | WebAuthn passkeys via @simplewebauthn/server + @simplewebauthn/browser |
| DB | Prisma + PostgreSQL (Neon in production) |
| Deploy | Vercel + Neon (Phase 4) |

### Route map

```
/                       home: onboarding if new user, dashboard if authenticated
/swipe                  swipe deck (requires auth)
/programme              program reader — 18 chapters (requires auth)
/resultats              live vote results (public)

/api/measures           GET  → measures.json array
/api/program            GET  → program.json array
/api/vote               POST → record a vote (Zod validated)
/api/vote/undo          POST → delete most recent matching vote
/api/results            GET  → { votes: Record<id, counts>, hash: string }

/api/auth/register/generate-options   POST → WebAuthn registration options
/api/auth/register/verify             POST → verify + store credential
/api/auth/authenticate/generate-options POST → WebAuthn auth options
/api/auth/authenticate/verify           POST → verify + return success
```

### Auth state machine

```
loading → onboarding → [passkey created] → ready
        → locked     → [passkey verified] → ready
```

`IdentityContext` (`context/IdentityContext.tsx`) owns this state. All protected pages redirect to `/` when `status !== 'ready'`.

### Vote choices

| choice | swipe direction | button |
|---|---|---|
| `pour` | right | ♥ |
| `contre` | left | ✕ |
| `prioritaire` | up | ★ |
| `discuter` | down | … |
| `incompris` | — | ? |

### Local identity model

```typescript
{
  id: string          // "sc_<hex32>" — stable, derived from seed hash
  pseudonym: string
  seed: string        // base64, 32 random bytes — NEVER leaves the browser
  createdAt: string
  passkey?: {
    credentialId: string
    userHandle: string
    createdAt: string
  }
  authenticatedAt?: string
}
```

The `seed` is the root of local AES-GCM encryption. WebAuthn passkeys gate access only — they do not replace the seed.

### DB schema (see `prisma/schema.prisma`)

| Table | Purpose |
|---|---|
| `Vote` | One row per vote cast: measureId, choice, voterId?, encryptedVote? |
| `WebAuthnCredential` | Stored passkey public keys |
| `WebAuthnChallenge` | Short-lived (60s) registration/auth challenges |

## Key invariants — ALL agents must respect

1. **Seed never leaves the browser** — never serialize or send `identity.seed` to any API
2. **Stable measure IDs** — integer `id` values in `data/measures.json` are FK references in `Vote` table; never renumber
3. **Zod validation** on every POST route before touching the DB
4. **Prisma singleton** — always import from `lib/db.ts`; never `new PrismaClient()` in route handlers
5. **`'use client'` on interactive components** — server components only for static data or DB reads
6. **WebAuthn requires HTTPS or localhost** — dev on `http://localhost:3000` is fine

## Environment variables

```bash
DATABASE_URL=            # Neon PostgreSQL connection string
WEBAUTHN_RP_ID=          # "localhost" in dev, your domain in prod (e.g. scrutinder.fr)
WEBAUTHN_ORIGIN=         # "http://localhost:3000" in dev, "https://scrutinder.fr" in prod
NEXT_PUBLIC_BASE_URL=    # Optional — base URL for absolute links
```

## Dependency discipline

**All runtime deps are pinned to exact versions** (no `^` / `~` in `dependencies`). `@types/*` devDeps use `^` since they are type-only.

When adding a new package:
1. `npm install <pkg>` — installs the latest
2. Read the actual installed type definitions before writing any code against it: `cat node_modules/<pkg>/dist/**/*.d.ts | grep "function <name>"` or `ls node_modules/<pkg>/`
3. Pin the exact version in `package.json`: replace `^x.y.z` with `x.y.z`
4. Commit `package-lock.json` with the change

When upgrading a package:
1. Read the changelog / release notes for breaking changes first
2. Check new type signatures in `node_modules` after install
3. Run `npm run typecheck` — fix all errors before committing

## Typecheck

```bash
npm run typecheck   # tsc --noEmit — run this before every commit
```

Zero errors is the bar. CI will enforce this in Phase 4.

## No test runner configured (Phase 1)

Manual validation checklist is in BACKLOG.md Phase 1 → Validation section.
