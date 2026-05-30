# Scrutinder

> **Swipez le programme. Mesurez l'adhésion populaire.**

Scrutinder est une application civique de type Tinder qui permet aux citoyens d'évaluer les 837 mesures du programme politique *L'Avenir en Commun* (LFI / Mélenchon 2027) - un swipe à la fois. Les comptages de votes sont agrégés en temps réel, chiffrés localement, et vérifiables par tous grâce à un hash d'intégrité public SHA-256.

Le nom est un mot-valise composé de **scrutin** et de **Tinder**.

---

## Fonctionnement

Chaque session présente un tirage aléatoire de 8 mesures issues du programme complet. Swipez - ou appuyez sur un bouton - pour exprimer votre vote :

| Geste | Direction | Signification |
|---|---|---|
| ♥ | Swipe droite | Pour - je soutiens cette mesure |
| ✕ | Swipe gauche | Contre - je m'y oppose |
| ★ | Swipe haut | Prioritaire - je soutiens ET c'est urgent |
| … | Swipe bas | À discuter - j'ai besoin de plus d'informations |
| ? | Bouton | Incompris - je ne comprends pas cette mesure |

Après 8 swipes, vous consultez les résultats agrégés de toutes les mesures sous forme de tableau triable, accompagnés d'un hash SHA-256 du décompte des votes - pour que chacun puisse vérifier que les chiffres n'ont pas été altérés.

---

## Modèle de confidentialité

- **Pas de compte, pas d'e-mail.** L'identité repose sur un passkey WebAuthn et une graine de 32 octets générée localement, stockée uniquement dans votre navigateur.
- **Les votes sont chiffrés côté client** (AES-GCM, clé dérivée de votre graine) avant d'être envoyés au serveur. Le serveur stocke des enveloppes chiffrées, pas les choix en clair.
- **Votre identifiant** (`sc_<hex32>`) est dérivé de `sha256(seed)` - il est impossible de le remonter jusqu'à vous.
- Le serveur reçoit : un identifiant de mesure, un libellé de choix, un pseudonyme de votant (optionnel) et une enveloppe chiffrée. Rien d'autre.

---

## Stack technique

| Couche | Choix |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Style | Tailwind CSS |
| Animations | Framer Motion (physique de swipe) |
| Auth | WebAuthn passkeys - `@simplewebauthn/server` + `@simplewebauthn/browser` |
| Base de données | Prisma + PostgreSQL (Neon serverless) |
| Déploiement | Vercel |

---

## Démarrage

### Prérequis

- Node.js 18+
- Une base de données PostgreSQL [Neon](https://neon.tech) (le niveau gratuit suffit)
- Un navigateur compatible WebAuthn (Chrome, Safari, Firefox - nécessite `localhost` ou HTTPS)

### 1. Cloner et installer

```bash
git clone <repo-url> scrutinder
cd scrutinder
npm install
```

### 2. Configurer l'environnement

```bash
cp .env.example .env
```

Éditez `.env` :

```bash
# Chaîne de connexion Neon PostgreSQL
DATABASE_URL=postgresql://user:password@host/scrutinder?sslmode=require&connect_timeout=10

# Origine WebAuthn - doit correspondre exactement à ce qui apparaît dans la barre d'adresse du navigateur
WEBAUTHN_RP_ID=localhost
WEBAUTHN_ORIGIN=http://localhost:3000
```

### 3. Initialiser la base de données

```bash
npm run db:generate   # générer le client Prisma
npm run db:push       # pousser le schéma vers Neon (dev uniquement - utiliser db:migrate en prod)
```

### 4. Lancer

```bash
npm run dev           # http://localhost:3000
```

---

## Scripts disponibles

```bash
npm run dev           # Serveur de développement Next.js
npm run build         # Build de production
npm start             # Serveur de production
npm run typecheck     # tsc --noEmit (à exécuter avant chaque commit)
npm run db:generate   # Regénérer le client Prisma après des changements de schéma
npm run db:push       # Synchroniser le schéma avec la DB (dev)
npm run db:migrate    # Créer une migration nommée (production)
npm run db:studio     # Ouvrir Prisma Studio (navigateur visuel de DB)
```

---

## Structure du projet

```
scrutinder/
├── app/
│   ├── page.tsx              # Accueil - onboarding ou tableau de bord
│   ├── swipe/page.tsx        # Deck de swipe
│   ├── programme/page.tsx    # Lecteur de programme (19 chapitres)
│   ├── resultats/page.tsx    # Résultats en direct + hash d'intégrité
│   └── api/                  # Gestionnaires de routes
│       ├── auth/             # WebAuthn register + authenticate
│       ├── measures/         # GET - retourne toutes les mesures
│       ├── program/          # GET - retourne tous les chapitres
│       ├── vote/             # POST - enregistre un vote
│       ├── vote/undo/        # POST - annule le dernier vote
│       └── results/          # GET - comptages agrégés + hash
├── components/               # Composants React UI
├── context/
│   └── IdentityContext.tsx   # Machine à états d'authentification
├── lib/
│   ├── identity.client.ts    # Navigateur : localStorage + chiffrement AES-GCM
│   ├── identity.server.ts    # Serveur : helpers @simplewebauthn
│   ├── db.ts                 # Singleton Prisma
│   ├── measures.ts           # Chargeur de données statiques
│   └── crypto.ts             # Hash SHA-256 des votes
├── data/
│   ├── measures.json         # 837 mesures politiques (IDs entiers stables)
│   └── program.json          # 19 chapitres du programme
├── prisma/
│   └── schema.prisma         # Vote, WebAuthnCredential, WebAuthnChallenge
├── types/index.ts            # Types TypeScript partagés
├── BACKLOG.md                # Suivi des tâches phase par phase
├── AGENTS.md                 # Rôles des agents IA et guide de coordination
└── CLAUDE.md                 # Référence rapide développeur/agent
```

---

## Référence API

Tous les endpoints sont sous `/api`.

| Méthode | Chemin | Description |
|---|---|---|
| `GET` | `/api/measures` | Retourne le tableau complet des mesures |
| `GET` | `/api/program` | Retourne tous les chapitres du programme |
| `POST` | `/api/vote` | Enregistre un vote `{ id, choice, voterId?, encryptedVote? }` |
| `POST` | `/api/vote/undo` | Supprime le vote correspondant le plus récent |
| `GET` | `/api/results` | Comptages agrégés des votes + hash SHA-256 |
| `POST` | `/api/auth/register/generate-options` | Démarre l'enregistrement d'un passkey |
| `POST` | `/api/auth/register/verify` | Vérifie et stocke le nouveau credential |
| `POST` | `/api/auth/authenticate/generate-options` | Démarre l'authentification par passkey |
| `POST` | `/api/auth/authenticate/verify` | Vérifie l'authentification |

---

## Schéma de base de données

```prisma
model Vote {
  id            String    // cuid
  measureId     Int       // FK vers l'id dans measures.json
  choice        String    // pour | contre | discuter | prioritaire | incompris
  voterId       String?   // sc_<hex32> identifiant d'identité (optionnel)
  encryptedVote Json?     // enveloppe chiffrée AES-GCM
  createdAt     DateTime
}

model WebAuthnCredential {
  credentialId  String    // unique, base64url
  userId        String    // sc_<hex32>
  publicKey     String    // clé publique CBOR, base64url
  counter       BigInt    // protection contre les attaques par rejeu
  ...
}

model WebAuthnChallenge {
  challenge     String    // unique, base64url - TTL 60s
  userId        String?
  expiresAt     DateTime
}
```

> **Note :** Les valeurs de `measureId` sont stables - elles ne doivent jamais être renumérotées, car elles sont utilisées comme clés étrangères dans la table `Vote`.

---

## Déploiement

### Vercel + Neon (recommandé)

1. Poussez vers GitHub et connectez le dépôt à [Vercel](https://vercel.com)
2. Ajoutez les variables d'environnement dans le tableau de bord Vercel :
   ```
   DATABASE_URL      → votre chaîne de connexion Neon (avec ?connect_timeout=10)
   WEBAUTHN_RP_ID    → votre domaine (ex. scrutinder.fr)
   WEBAUTHN_ORIGIN   → https://scrutinder.fr
   ```
3. Exécutez la migration de production une fois :
   ```bash
   npx prisma migrate deploy
   ```
4. Déployez - Vercel détecte Next.js automatiquement.

> **WebAuthn nécessite HTTPS.** Les passkeys ne fonctionnent pas sur `http://` simple, sauf sur `localhost`.

---

## Feuille de route

| Phase | Statut | Objectif |
|---|---|---|
| 1 - Fondation | ✅ Terminée | Next.js + Prisma + WebAuthn + parité fonctionnelle avec le prototype |
| 2 - Finition UX | 🔵 Suivante | Réglage Framer Motion, PWA, zones sécurisées mobiles, accessibilité |
| 3 - Communauté | 🔵 Planifiée | Fils de discussion sur les mesures débattues, boîte à idées, vue admin |
| 4 - Production | 🔵 Planifiée | Déploiement Vercel, domaine personnalisé, Sentry, tests de charge |
| 5 - Web3 | ⏸ Reportée | Ancrage des votes sur Polkadot Bulletin Chain, page de vérification publique |

Voir [BACKLOG.md](BACKLOG.md) pour la liste détaillée des tâches.

---

## Contribuer

Voir [AGENTS.md](AGENTS.md) pour l'architecture de coordination des agents IA et [CLAUDE.md](CLAUDE.md) pour les commandes développeur et les invariants clés.

**Règle sur les dépendances :** toutes les dépendances de production sont épinglées à des versions exactes. Lors de l'ajout d'un package, lisez toujours les définitions de types installées avant d'écrire les sites d'appel, puis épinglez la version. Exécutez `npm run typecheck` avant de committer.

---

## Licence

MIT
