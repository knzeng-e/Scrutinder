# AGENTS.md - Architecture agentique de Scrutinder

> Ce fichier définit comment les agents IA naviguent dans Scrutinder et y contribuent.
> **Toujours lire [BACKLOG.md](BACKLOG.md) en premier** pour trouver les tâches ouvertes et comprendre la phase en cours.
> **Toujours lire [CLAUDE.md](CLAUDE.md) en premier** pour les commandes et invariants du projet.

---

## Protocole d'entrée pour chaque agent

1. Lire `BACKLOG.md` → trouver la phase en cours et les tâches 🔵 ouvertes dans votre périmètre
2. Lire `CLAUDE.md` → vérifier les commandes et invariants
3. Marquer la tâche 🟡 EN COURS dans `BACKLOG.md` avant de toucher au code
4. Implémenter dans votre périmètre (voir les rôles ci-dessous)
5. Marquer la tâche ✅ TERMINÉ dans `BACKLOG.md` quand c'est fait
6. Si quelque chose de non évident a été découvert, mettre à jour la mémoire ou ajouter une note dans BACKLOG.md

---

## Rôles des agents

### `frontend-agent`

**Périmètre :** `app/**/*.tsx` (pages), `components/**/*.tsx`, `app/globals.css`, `tailwind.config.ts`
**Responsabilités :** Composants React, style Tailwind, animations Framer Motion, mise en page responsive
**Lit :** `types/index.ts`, `context/IdentityContext.tsx` (consommation uniquement, ne pas modifier)
**Ne touche jamais à :** `lib/identity.server.ts`, `prisma/`, gestionnaires de routes API, `lib/db.ts`
**Patterns clés :**

- Tous les composants interactifs doivent être `'use client'`
- Les composants serveur ne peuvent être utilisés que pour les pages qui passent des données statiques en props
- Utiliser le hook `useIdentity()` pour l'état d'authentification - ne jamais lire localStorage directement dans les composants

### `backend-agent`

**Périmètre :** `app/api/**/*.ts` (hors `/api/auth`), `lib/db.ts`, `lib/measures.ts`, `lib/crypto.ts`, `prisma/schema.prisma`
**Responsabilités :** Gestionnaires de routes API, schéma DB, comptage des votes, hash des résultats
**Patterns clés :**

- Chaque route POST valide l'entrée avec Zod avant tout appel DB
- Ne jamais retourner des erreurs Prisma brutes au client
- Utiliser le singleton de `lib/db.ts` - jamais `new PrismaClient()`
- `Vote.choice` est un enum : `pour | contre | discuter | prioritaire | incompris` - pas d'ajout sans migration

### `auth-agent`

**Périmètre :** `lib/identity.client.ts`, `lib/identity.server.ts`, `context/IdentityContext.tsx`, `app/api/auth/**/*.ts`
**Responsabilités :** Flux de passkeys WebAuthn, chiffrement AES-GCM des votes, cycle de vie de l'identité
**Invariants critiques :**

- `identity.seed` est généré côté navigateur et stocké uniquement dans `localStorage` - **il ne doit jamais être envoyé au serveur**
- Les challenges WebAuthn expirent en 60 secondes - nettoyer les challenges expirés à chaque requête
- `WEBAUTHN_RP_ID` doit correspondre exactement à l'origine : `localhost` en dev, domaine réel en prod
- À la création du passkey, `sc_<hex32>` est dérivé de `sha256(seed)` - c'est stable et déterministe

### `data-agent`

**Périmètre :** `data/measures.json`, `data/program.json`, `scripts/` (futurs scripts de synchronisation)
**Responsabilités :** Maintenir les données des mesures et du programme à jour
**Invariant critique :** Les valeurs `id` dans `measures.json` sont des références FK entières dans la table `Vote` - **ne jamais renuméroter ni réutiliser les IDs** ; si une mesure est supprimée, laisser un vide ou la marquer comme dépréciée

### `devops-agent`

**Périmètre :** `vercel.json`, `.github/workflows/`, `prisma/migrations/`, configuration d'environnement
**Responsabilités :** Pipeline de déploiement, CI/CD, mise en place du monitoring, gestion des migrations
**Tâches clés :** Éléments de la Phase 4 dans BACKLOG.md
**Important :** Utiliser `prisma migrate deploy` (pas `db push`) en production

---

## Carte des fichiers

```text
scrutinder/
├── CLAUDE.md              ← Commandes, architecture, invariants (LIRE EN PREMIER)
├── BACKLOG.md             ← État des tâches (METTRE À JOUR au fil du travail)
├── AGENTS.md              ← Ce fichier - rôles des agents et coordination
│
├── app/
│   ├── layout.tsx         ← Layout racine : polices, métadonnées, wrapper IdentityProvider
│   ├── globals.css        ← Directives Tailwind + propriétés CSS personnalisées
│   ├── page.tsx           ← Accueil : délègue à IdentityGate ou au tableau de bord
│   ├── swipe/
│   │   └── page.tsx       ← Passe measures[] à SwipeDeck (serveur → client)
│   ├── programme/
│   │   └── page.tsx       ← Passe program[] à ProgramReader (serveur → client)
│   ├── resultats/
│   │   └── page.tsx       ← Récupère les résultats depuis la DB côté serveur, passe à ResultsDashboard
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
│   ├── AppShell.tsx       ← En-tête + navigation (marque, bouton identité, liens nav)
│   ├── IdentityGate.tsx   ← UI de création / déverrouillage de passkey
│   ├── SwipeDeck.tsx      ← Deck de swipe Framer Motion + modal de détail de carte
│   ├── ActionBar.tsx      ← Boutons de vote (contre, incompris, pour, prioritaire, annuler)
│   ├── ProgramReader.tsx  ← Grille de chapitres + vue ChapterDetail
│   └── ResultsDashboard.tsx ← Cartes de statistiques + tableau de mesures triable
│
├── context/
│   └── IdentityContext.tsx ← Machine à états d'auth, appels passkey, cycle de vie de l'identité
│
├── lib/
│   ├── db.ts              ← Singleton Prisma (importer ceci, jamais new PrismaClient)
│   ├── measures.ts        ← Chargeurs statiques typés pour measures.json + program.json
│   ├── crypto.ts          ← computeVoteHash(votes) → chaîne hex SHA-256
│   ├── identity.client.ts ← Navigateur : identité localStorage, AES-GCM, @simplewebauthn/browser
│   └── identity.server.ts ← Serveur : helpers d'enregistrement + auth @simplewebauthn/server
│
├── types/
│   └── index.ts           ← Measure, ProgramChapter, Identity, VoteChoice, ResultsData, etc.
│
├── data/
│   ├── measures.json      ← Mesures politiques (IDs entiers stables - ne jamais renuméroter !)
│   └── program.json       ← Chapitres du programme (18 entrées)
│
├── prisma/
│   └── schema.prisma      ← Vote + WebAuthnCredential + WebAuthnChallenge
│
├── public/
│   └── images/            ← Images de mesures et chapitres (migrées depuis ../swipe_app/public)
│
└── .env.example           ← Modèle des variables d'environnement requises
```

---

## Communication inter-agents

Les agents ne communiquent pas directement - ils partagent l'état via :

1. `BACKLOG.md` - statut des tâches
2. `types/index.ts` - contrats de données partagés
3. `CLAUDE.md` - invariants et commandes

Si un agent découvre un bug ou un bloquant hors de son périmètre, il doit :

1. Ajouter une note 🔴 BLOQUÉ à la tâche concernée dans BACKLOG.md
2. Décrire le problème clairement pour que l'agent responsable puisse le prendre en charge

---

## Patterns communs

### Ajouter une nouvelle route API

1. Créer `app/api/<name>/route.ts`
2. Importer le schéma Zod pour la validation du corps POST
3. Importer `prisma` depuis `lib/db.ts`
4. Ajouter la route à la carte des routes dans CLAUDE.md
5. Marquer la tâche BACKLOG.md ✅

### Ajouter un nouveau composant

1. Créer `components/<Name>.tsx` avec `'use client'` en haut du fichier
2. Importer `useIdentity()` si l'état d'authentification est nécessaire
3. Utiliser les classes Tailwind - pas de styles inline sauf pour les valeurs dynamiques
4. Ajouter le composant à la carte des fichiers dans AGENTS.md

### Modifier le schéma DB

1. Éditer `prisma/schema.prisma`
2. Exécuter `npm run db:generate` pour regénérer le client Prisma
3. Exécuter `npm run db:push` (dev) ou créer un fichier de migration (prod)
4. Mettre à jour le tableau de schéma dans CLAUDE.md si le changement est significatif

### Mettre à jour les fichiers de données

1. Modifier `data/measures.json` ou `data/program.json`
2. Lors de l'ajout de nouvelles mesures, continuer la séquence entière - ne jamais réutiliser les IDs supprimés
3. Exécuter `npm run db:push` si vous avez ajouté de nouvelles mesures nécessitant des compteurs de votes pré-remplis
