# Parlement Populaire - Backlog

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
**Statut :** ✅ TERMINÉE

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

- ✅ `components/AppShell.tsx` - en-tête + wrapper de navigation _(livré sous le nom `AppHeader`, puis remplacé par la barre d'onglets `components/pp/BottomNav.tsx` à la refonte ; voir Phase 3.5)_
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
**Statut :** ✅ TERMINÉE

- ✅ Vélocité de swipe (flick gesture) + physique des ressorts Framer Motion
- ✅ Marges de zone sécurisée mobile (`env(safe-area-inset-*)` via classes Tailwind)
- ✅ PWA : `public/manifest.json` + icônes PNG dynamiques + méta `apple-web-app`
- ✅ Navigation au clavier : flèches ← → ↑ ↓ pour voter depuis le deck (desktop)
- ✅ Images des mesures avec `next/image` (`priority` sur la carte active, lazy sur la suivante)
- ✅ Panneau de compte (`AccountPanel`) : historique votes, pseudonyme, verrouillage, suppression _(refondu en écran plein `/compte` + `components/Compte.tsx` à la refonte ; `AccountPanel` supprimé)_
- ✅ `AppHeader` partagé : marque + bouton compte sur toutes les pages authentifiées _(remplacé par la barre d'onglets `BottomNav` à la refonte ; `AppHeader` supprimé)_
- ✅ Anti-bourrage : 1 vote par `voterId` par `measureId` (contrainte unique + upsert dans `/api/vote`)
- ✅ Squelettes de chargement (`loading.tsx` pour resultats / swipe / programme + `SkeletonHeader`)
- ✅ Carte de partage OG pour la page de résultats (`app/resultats/opengraph-image.tsx`, total de votes en direct)
- ✅ Icônes PNG 192/512 + favicon + apple-icon via `next/og` (`app/icon.tsx`, `app/apple-icon.tsx`, `app/icons/icon-{192,512}`)
- ✅ Bascule thème clair/sombre : tokens CSS sémantiques + `ThemeProvider` (persistance + `prefers-color-scheme` + anti-flash) + toggle dans `AccountPanel` _(retiré à la refonte : thème unique « papier » clair ; `ThemeContext` supprimé)_
- ✅ Primitives UI : `cn()`, `Button`, `Modal` (dialog), système de `Toast` (utilisé pour l'enregistrement du pseudo)

> Note : migration vers un design system tiers complet (shadcn/ui) volontairement écartée — les primitives maison (`components/ui/`) couvrent dialogs / toasts / boutons sans dépendance supplémentaire.

> ⚠️ **Migration DB requise** avant le prochain `npm run dev` : le modèle `Vote` a une nouvelle
> contrainte `@@unique([voterId, measureId])` et un champ `updatedAt`. Lancer `npm run db:push`
> (Node 18+). Si des votes en double existent déjà, réinitialiser la table de test au préalable.

---

## Phase 3 - Fonctionnalités communautaires

**Objectif :** Espaces de discussion pour les mesures débattues + boîte à contributions.
**Statut :** ✅ TERMINÉE (hors relais événements, reporté)

- ✅ Fils de discussion par mesure (modèle `Comment`, API + page `/mesures/[id]`)
- ✅ Formulaire de soumission d'idées/contributions par mesure (modèle `Contribution`, onglet « Idées »)
- ✅ Tableau de bord admin (`/admin`, gate `ADMIN_PASSWORD`) : mesures les plus débattues + export CSV
- ✅ Carte de résumé de session partageable (Canvas → PNG) dans l'écran de fin de round _(déclencheur retiré du nouvel écran de fin à la refonte ; `lib/share-card.ts` supprimé — à recâbler si souhaité)_
- ✅ Liens transverses : détail swipe → discussion, lignes de résultats → page mesure
- ⏸️ Relais d'événements Citoyen café (géolocalisé) — reporté : le moins central, à reprendre après déploiement

> ⚠️ **Migration DB requise** : nouveaux modèles `Comment` + `Contribution`. Lancer `npm run db:push` (Node 18+).
> Nouvelle variable d'env `ADMIN_PASSWORD` à définir pour activer `/admin`.

---

## Phase 3.5 - Refonte visuelle « Parlement Populaire »

**Objectif :** Refonte intégrale de l'identité visuelle (Scrutinder → **Parlement Populaire**), passage d'un thème sombre « SaaS » à une esthétique d'affiche militante, à partir du handoff Claude Design (direction A « Affiche »).
**Statut :** ✅ TERMINÉE

- ✅ Design tokens papier/violet/rouge + ombres dures dans `tailwind.config.ts` et `app/globals.css`
- ✅ Polices `next/font/google` : Anton (titres), Oswald (labels), Hanken Grotesk (corps)
- ✅ Renommage de l'app en « Parlement Populaire » (layout, manifest, favicon, OG, écran d'accueil)
- ✅ Primitives `components/pp/` : `Icon`, `votes`, `DistBar`, `ChapterTag`, `ScreenHead`, `Segmented`, `PosterImage`, `BigStat`, `BottomNav` (barre d'onglets à 5 entrées)
- ✅ `lib/poster.ts` (chapitres / images / méta) + `lib/stats.ts` (stats déterministes simulées en repli des comptages réels) + hooks `useResults` / `usePoster`
- ✅ `context/VotesContext.tsx` : déchiffrement local + `recordVote` / `undo` partagés (swipe, détail, compte)
- ✅ Onboarding 3 étapes + écran verrouillé/récupération + mode invité (`continueAsGuest`)
- ✅ Accueil « tableau de bord » (direction A) : hero, bandeau stats, priorités populaires, à débattre, contribuer
- ✅ Deck de swipe refondu (cartes affiche, 5 boutons ronds, overlay verbe, écran de fin)
- ✅ Détail mesure plein écran : sélecteur de vote, résultats publics, hash, discussion + boîte à idées (`MeasureCommunity` restylé)
- ✅ Programme (recherche + chapitres dépliables), Résultats (carte méta, tri segmenté, podium, classement), Compte (`/compte`)
- ✅ Réinitialisation ponctuelle du `localStorage` (`resetStaleLocalState`, gardée par `STATE_VERSION`)
- ✅ Nettoyage : suppression de `AppHeader`, `AccountPanel`, `ThemeContext`, `ActionBar`, `lib/share-card.ts` ; tirets cadratins remplacés par des traits d'union dans les textes
- ✅ `npm run typecheck` + `npm run build` OK ; fumée HTTP 200 sur toutes les routes

> Invariants préservés : la graine ne quitte pas le navigateur, IDs de mesures inchangés, chiffrement AES-GCM + hash d'intégrité conservés, identifiants internes (`scrutinder.*`, RP WebAuthn) laissés tels quels pour ne pas orpheliner les passkeys / votes existants.

---

## Phase 4 - Déploiement en production

**Objectif :** En ligne, sécurisé, monitoré sur Vercel + Neon.
**Démarrer quand :** Les fonctionnalités de la Phase 3 sont stables (ou passer la Phase 3 et déployer après la Phase 2).

- 🔵 Projet Vercel créé + dépôt GitHub connecté
- 🔵 PostgreSQL Neon provisionné, `DATABASE_URL` défini dans les variables d'environnement Vercel
- 🔵 Domaine personnalisé (ex. `parlement-populaire.fr`) + HTTPS imposé
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

**Phases 1 à 3.5 terminées** (fondation, finition UX, communauté, refonte visuelle « Parlement Populaire »).

**Prochaine étape : Phase 4 - Déploiement.** Provisionner Vercel + Neon, définir `WEBAUTHN_RP_ID` / `WEBAUTHN_ORIGIN` / `DATABASE_URL` / `ADMIN_PASSWORD` en production, brancher le domaine + HTTPS, puis test de fumée WebAuthn sur iOS Safari et Chrome Android.
