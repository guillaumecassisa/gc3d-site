# Installation (poste de développement)

## Prérequis

- Node.js 22.12 ou plus récent
- PostgreSQL 15 ou plus récent (local, Docker ou base managée)
- Google Chrome (pour les tests de bout en bout uniquement)

## Étapes

```bash
npm install                     # installe et génère le client Prisma
cp .env.example .env            # puis remplir DATABASE_URL, BETTER_AUTH_SECRET, IP_HASH_SALT
npm run db:deploy               # applique les migrations
SEED_OWNER_EMAIL=vous@exemple.fr SEED_OWNER_PASSWORD='un-mot-de-passe-long' npm run db:seed
npm run dev                     # http://localhost:3000
```

Secrets :

```bash
openssl rand -base64 48   # BETTER_AUTH_SECRET
openssl rand -hex 24      # IP_HASH_SALT
```

Base PostgreSQL rapide avec Docker :

```bash
docker run -d --name gc3d-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=gc3d postgres:16
```

## Commandes utiles

| Commande | Rôle |
|---|---|
| `npm run check` | Types + lint + tests unitaires |
| `TEST_DATABASE_URL=… npm run test:integration` | Tests sur une base **dédiée** (jamais la base de dev) |
| `E2E_ADMIN_PASSWORD=… npm run test:e2e` | Parcours navigateur (serveur lancé) |
| `npm run db:migrate` | Créer une migration après modification de `prisma/schema.prisma` |
| `npm run db:studio` | Explorer la base |

## Modifier le modèle de données

1. Éditer `prisma/schema.prisma`.
2. `npm run db:migrate -- --name description_courte` (génère et applique la migration).
3. Committer le dossier `prisma/migrations/` avec le code.

Ne jamais modifier une migration déjà appliquée en production.
