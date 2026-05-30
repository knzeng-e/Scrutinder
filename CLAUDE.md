# CLAUDE.md — Scrutinder

> Swipez les mesures politiques. Mesurez l'adhésion populaire. WebAuthn + Next.js 15 + Neon PostgreSQL.
> **Lisez [BACKLOG.md](BACKLOG.md) pour l'état des tâches. Lisez [AGENTS.md](AGENTS.md) pour les rôles des agents.**

## Vue d'ensemble de l'application

Scrutinder est une application civique inspirée de Tinder qui permet aux utilisateurs de swiper les mesures du programme politique _L'Avenir en Commun_ (LFI / Mélenchon 2027). Les votes sont chiffrés localement (AES-GCM), les comptages agrégés persistent dans PostgreSQL, et un hash SHA-256 permet la vérification publique de l'intégrité.

**Migré depuis :** `../swipe_app` (prototype Vite/React/Node.js simple → conservé pour référence)

## Commandes

```bash
# Développement (nécessite DATABASE_URL dans .env.local)
npm run dev            # Serveur de développement Next.js → http://localhost:3000
npm run build          # Build de production
npm start              # Serveur de production

# Base de données
npm run db:push        # Pousser le schéma vers Neon (sans fichier de migration)
npm run db:generate    # Regénérer le client Prisma après des changements de schéma
npm run db:studio      # Ouvrir Prisma Studio (navigateur visuel de DB)
npm run db:migrate     # Créer + appliquer une migration nommée (à utiliser en prod)

# Configuration initiale
cp .env.example .env.local
# Remplir DATABASE_URL, WEBAUTHN_RP_ID, WEBAUTHN_ORIGIN
npm install
npm run db:generate
npm run db:push
npm run dev
```

## Architecture

| Couche | Choix |
|---|---|
| Framework | Next.js 15 App Router + TypeScript |
| Style | Tailwind CSS + shadcn/ui (Phase 2) |
| Animations | Framer Motion (physique de swipe) |
| Auth | WebAuthn passkeys via @simplewebauthn/server + @simplewebauthn/browser |
| DB | Prisma + PostgreSQL (Neon en production) |
| Déploiement | Vercel + Neon (Phase 4) |

### Carte des routes

```
/                       accueil : onboarding si nouvel utilisateur, tableau de bord si authentifié
/swipe                  deck de swipe (authentification requise)
/programme              lecteur de programme — 18 chapitres (authentification requise)
/resultats              résultats des votes en direct (public)

/api/measures           GET  → tableau measures.json
/api/program            GET  → tableau program.json
/api/vote               POST → enregistre un vote (validé par Zod)
/api/vote/undo          POST → supprime le vote correspondant le plus récent
/api/results            GET  → { votes: Record<id, counts>, hash: string }

/api/auth/register/generate-options   POST → options d'enregistrement WebAuthn
/api/auth/register/verify             POST → vérifier + stocker le credential
/api/auth/authenticate/generate-options POST → options d'authentification WebAuthn
/api/auth/authenticate/verify           POST → vérifier + retourner le succès
```

### Machine à états d'authentification

```
loading → onboarding → [passkey créé]   → ready
        → locked     → [passkey vérifié] → ready
```

`IdentityContext` (`context/IdentityContext.tsx`) gère cet état. Toutes les pages protégées redirigent vers `/` quand `status !== 'ready'`.

### Choix de vote

| choice | direction du swipe | bouton |
|---|---|---|
| `pour` | droite | ♥ |
| `contre` | gauche | ✕ |
| `prioritaire` | haut | ★ |
| `discuter` | bas | … |
| `incompris` | — | ? |

### Modèle d'identité locale

```typescript
{
  id: string          // "sc_<hex32>" — stable, dérivé du hash de la graine
  pseudonym: string
  seed: string        // base64, 32 octets aléatoires — ne quitte JAMAIS le navigateur
  createdAt: string
  passkey?: {
    credentialId: string
    userHandle: string
    createdAt: string
  }
  authenticatedAt?: string
}
```

La `seed` est la racine du chiffrement AES-GCM local. Les passkeys WebAuthn servent uniquement à contrôler l'accès — ils ne remplacent pas la graine.

### Schéma DB (voir `prisma/schema.prisma`)

| Table | Rôle |
|---|---|
| `Vote` | Une ligne par vote : measureId, choice, voterId?, encryptedVote? |
| `WebAuthnCredential` | Clés publiques de passkeys stockées |
| `WebAuthnChallenge` | Challenges d'enregistrement/authentification de courte durée (60s) |

## Invariants clés — TOUS les agents doivent les respecter

1. **La graine ne quitte jamais le navigateur** — ne jamais sérialiser ni envoyer `identity.seed` à une API
2. **IDs de mesures stables** — les valeurs `id` entières dans `data/measures.json` sont des références FK dans la table `Vote` ; ne jamais renuméroter
3. **Validation Zod** sur chaque route POST avant toute interaction avec la DB
4. **Singleton Prisma** — toujours importer depuis `lib/db.ts` ; jamais `new PrismaClient()` dans les gestionnaires de routes
5. **`'use client'` sur les composants interactifs** — les composants serveur uniquement pour les données statiques ou les lectures DB
6. **WebAuthn nécessite HTTPS ou localhost** — le développement sur `http://localhost:3000` est acceptable

## Variables d'environnement

```bash
DATABASE_URL=            # Chaîne de connexion Neon PostgreSQL
WEBAUTHN_RP_ID=          # "localhost" en dev, votre domaine en prod (ex. scrutinder.fr)
WEBAUTHN_ORIGIN=         # "http://localhost:3000" en dev, "https://scrutinder.fr" en prod
NEXT_PUBLIC_BASE_URL=    # Optionnel — URL de base pour les liens absolus
```

## Discipline sur les dépendances

**Toutes les dépendances de production sont épinglées à des versions exactes** (pas de `^` / `~` dans `dependencies`). Les `@types/*` devDeps utilisent `^` car ils ne concernent que les types.

Lors de l'ajout d'un nouveau package :

1. `npm install <pkg>` — installe la dernière version
2. Lire les définitions de types installées avant d'écrire du code : `cat node_modules/<pkg>/dist/**/*.d.ts | grep "function <name>"` ou `ls node_modules/<pkg>/`
3. Épingler la version exacte dans `package.json` : remplacer `^x.y.z` par `x.y.z`
4. Committer `package-lock.json` avec le changement

Lors de la mise à jour d'un package :

1. Lire les notes de version pour les changements incompatibles
2. Vérifier les nouvelles signatures de types dans `node_modules` après installation
3. Exécuter `npm run typecheck` — corriger toutes les erreurs avant de committer

## Vérification des types

```bash
npm run typecheck   # tsc --noEmit — à exécuter avant chaque commit
```

Zéro erreur est la norme. La CI le vérifiera en Phase 4.

## Pas de test runner configuré (Phase 1)

La liste de vérification manuelle se trouve dans BACKLOG.md Phase 1 → section Validation.
