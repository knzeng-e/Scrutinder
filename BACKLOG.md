# Scrutinder - Backlog

> **À lire avant de commencer toute tâche.** Marquer les tâches 🟡 au démarrage, ✅ quand elles sont terminées.
> Une seule tâche en cours à la fois par agent. Voir [AGENTS.md](AGENTS.md) pour les rôles des agents.

## Légende des statuts

| Symbole | Signification |
| --- | --- |
| 🔵 | À FAIRE - non démarré |
| 🟡 | EN COURS |
| ✅ | TERMINÉ |
| 🔴 | BLOQUÉ - préciser la raison en ligne |
| ⏸️ | REPORTÉ - intentionnellement différé |

---

## Phase 1 - Fondation Next.js

**Objectif :** Parité fonctionnelle avec le prototype Vite/Node.js (`../swipe_app`), avec DB persistante et vérification WebAuthn côté serveur.
**Statut :** 🟡 EN COURS

### 1.1 Scaffold et configuration du projet

- ✅ `CLAUDE.md` - contexte du projet, commandes, invariants
- ✅ `BACKLOG.md` - ce fichier
- ✅ `AGENTS.md` - architecture agentique
- ✅ `package.json` - Next.js 15, Prisma, Framer Motion, simplewebauthn, Zod
- ✅ `next.config.ts`
- ✅ `tsconfig.json`
- ✅ `tailwind.config.ts`
- ✅ `postcss.config.mjs`
- ✅ `.env.example`
- ✅ `.gitignore`

### 1.2 Couche de données

- ✅ `prisma/schema.prisma` - Vote, WebAuthnCredential, WebAuthnChallenge
- ✅ `types/index.ts` - types TypeScript partagés
- ✅ `lib/db.ts` - singleton Prisma
- ✅ `lib/measures.ts` - chargeur de données statiques
- ✅ `lib/crypto.ts` - hash SHA-256 des votes
- ✅ `data/measures.json` - migré depuis le prototype
- ✅ `data/program.json` - migré depuis le prototype
- ✅ `public/images/` - images de mesures et chapitres migrées

### 1.3 Identité et authentification

- ✅ `lib/identity.client.ts` - localStorage + AES-GCM (navigateur uniquement)
- ✅ `lib/identity.server.ts` - helpers @simplewebauthn/server
- ✅ `context/IdentityContext.tsx` - état d'authentification global
- ✅ `app/api/auth/register/generate-options/route.ts`
- ✅ `app/api/auth/register/verify/route.ts`
- ✅ `app/api/auth/authenticate/generate-options/route.ts`
- ✅ `app/api/auth/authenticate/verify/route.ts`

### 1.4 Routes API

- ✅ `app/api/measures/route.ts`
- ✅ `app/api/program/route.ts`
- ✅ `app/api/vote/route.ts`
- ✅ `app/api/vote/undo/route.ts`
- ✅ `app/api/results/route.ts`

### 1.5 Shell et pages de l'application

- ✅ `app/layout.tsx` + `app/globals.css`
- ✅ `app/page.tsx` - accueil / onboarding / tableau de bord
- ✅ `app/swipe/page.tsx`
- ✅ `app/programme/page.tsx`
- ✅ `app/resultats/page.tsx`

### 1.6 Composants

- ✅ `components/AppShell.tsx` - en-tête + wrapper de navigation
- ✅ `components/IdentityGate.tsx` - UI de création/déverrouillage de passkey
- ✅ `components/SwipeDeck.tsx` - deck de swipe Framer Motion
- ✅ `components/ActionBar.tsx` - boutons de vote
- ✅ `components/ProgramReader.tsx` - navigateur de chapitres + détail
- ✅ `components/ResultsDashboard.tsx` - statistiques + tableau triable

### 1.7 Validation (manuelle)

- ✅ Exécuter `npm install` - zéro erreur
- ✅ Exécuter `npm run db:generate` - client Prisma généré
- ✅ Exécuter `npm run db:push` - schéma appliqué à Neon
- ✅ `npm run dev` démarre sans erreur
- ✅ La création de passkey fonctionne sur `localhost` (Chrome/Safari)
- ✅ Le déverrouillage par passkey fonctionne sur le même appareil
- ✅ Swipe → la ligne de vote apparaît dans la table `Vote` (vérifier via Prisma Studio)
- ✅ Annulation → ligne de vote supprimée
- ✅ La page de résultats affiche les bons comptages
- ✅ Le lecteur de programme affiche les 18 chapitres

---

## Phase 2 - Finition UX

**Objectif :** UX de qualité production, accessibilité, PWA.
**Statut :** 🟡 EN COURS

- ✅ Vélocité de swipe (flick gesture) + physique des ressorts Framer Motion
- ✅ Marges de zone sécurisée mobile (`env(safe-area-inset-*)` via classes Tailwind)
- ✅ PWA : `public/manifest.json` + `public/icons/icon.svg` + méta `apple-web-app`
- ✅ Navigation au clavier : flèches ← → ↑ ↓ pour voter depuis le deck (desktop)
- ✅ Images des mesures avec `next/image` (`priority` sur la carte active, lazy sur la suivante)
- ✅ Panneau de compte (`AccountPanel`) : historique votes, pseudonyme, verrouillage, suppression
- ✅ `AppHeader` partagé : marque + bouton compte sur toutes les pages authentifiées
- ✅ Anti-bourrage : 1 vote par `voterId` par `measureId` (contrainte unique + upsert dans `/api/vote`)
- ✅ Squelettes de chargement (`loading.tsx` pour resultats / swipe / programme + `SkeletonHeader`)
- ✅ Carte de partage OG pour la page de résultats (`app/resultats/opengraph-image.tsx`, total de votes en direct)
- 🔵 Icônes PNG 192×512 (générer depuis `public/icons/icon.svg` pour installation PWA complète)
- 🔵 Bascule thème clair/sombre (respecte `prefers-color-scheme`)
- 🔵 Intégration shadcn/ui pour les dialogs, toasts, boutons

> ⚠️ **Migration DB requise** avant le prochain `npm run dev` : le modèle `Vote` a une nouvelle
> contrainte `@@unique([voterId, measureId])` et un champ `updatedAt`. Lancer `npm run db:push`
> (Node 18+). Si des votes en double existent déjà, réinitialiser la table de test au préalable.

---

## Phase 3 - Fonctionnalités communautaires

**Objectif :** Espaces de discussion pour les mesures débattues + boîte à contributions.
**Démarrer quand :** La Phase 2 est terminée et l'application est déployée.

- 🔵 Fils de discussion par mesure (stockés en DB, triés par comptage `discuter`)
- 🔵 Formulaire de soumission d'idées/contributions par mesure
- 🔵 Tableau de bord admin (protégé par mot de passe) : mesures les plus débattues, export CSV
- 🔵 Carte de résumé de session de vote partageable (Canvas API → téléchargement PNG)
- 🔵 Relais d'événements Citoyen café : les groupes peuvent épingler des rassemblements sur une page de mesure

---

## Phase 4 - Déploiement en production

**Objectif :** En ligne, sécurisé, monitoré sur Vercel + Neon.
**Démarrer quand :** Les fonctionnalités de la Phase 3 sont stables (ou passer la Phase 3 et déployer après la Phase 2).

- 🔵 Projet Vercel créé + dépôt GitHub connecté
- 🔵 PostgreSQL Neon provisionné, `DATABASE_URL` défini dans les variables d'environnement Vercel
- 🔵 Domaine personnalisé (ex. `scrutinder.fr`) + HTTPS imposé
- 🔵 `WEBAUTHN_RP_ID` + `WEBAUTHN_ORIGIN` définis aux valeurs de production
- 🔵 Suivi d'erreurs Sentry (`@sentry/nextjs`)
- 🔵 Vercel Analytics activé
- 🔵 Test de fumée : iOS Safari + Chrome Android - WebAuthn doit fonctionner
- 🔵 Test de charge : 500 votants simultanés
- 🔵 `prisma migrate deploy` exécuté pour la migration de production

---

## Phase 5 - Couche de transparence Web3 ⏸️ REPORTÉE

**Objectif :** Ancrer les agrégats de votes sur Polkadot Bulletin Chain pour une vérifiabilité publique.
**Reporté jusqu'à :** Base d'utilisateurs solide établie après la Phase 4.

- ⏸️ Intégration `@parity/bulletin-sdk`
- ⏸️ Snapshot horaire des votes → CID publié sur la Bulletin Chain
- ⏸️ Page `/verifier` : récupérer l'état de la chaîne, comparer avec la DB en direct
- ⏸️ Mise à niveau d'identité optionnelle : lier le passkey à une adresse Polkadot

---

## Focus actuel

**Phase 1.7 Validation** - configurer `.env.local`, exécuter `npm install && npm run db:generate && npm run db:push`, puis valider manuellement.
