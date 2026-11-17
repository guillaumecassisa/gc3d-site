# GC3D — Boutique et atelier en ligne

Boutique e-commerce, devis sur mesure et suivi de fabrication pour **GC3D** — gravure laser, découpe laser, impression UV et impression 3D.

**État : phase 1 (fondations) terminée.** Le détail fonction par fonction est dans [docs/ROADMAP.md](docs/ROADMAP.md).

| Document | Contenu |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Analyse, stack, organisation du code, modèle de données, sécurité |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Décisions commerciales à prendre et hypothèses retenues |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Phases, critères de validation, état d'avancement |
| [docs/INSTALLATION.md](docs/INSTALLATION.md) | Installation locale, commandes |
| [docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md) | Mise en production, sauvegardes, surveillance |

## Démarrage rapide

```bash
npm install
cp .env.example .env     # compléter les variables
npm run db:deploy
npm run db:seed
npm run dev
```

Stack : Next.js 16 · TypeScript strict · Tailwind CSS 4 · PostgreSQL · Prisma 7 · Better Auth · Stripe · S3 · Resend.
