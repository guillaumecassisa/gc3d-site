# Déploiement et exploitation

> Le site **n'est pas prêt pour la production** tant que les phases 3 (paiement) et 8 (finalisation) ne sont pas validées et que la liste de contrôle du tableau de bord administrateur n'est pas entièrement verte.

## Services à ouvrir au nom de GC3D

| Service | Usage | Variables |
|---|---|---|
| Hébergeur Next.js (Vercel, Scalingo, Railway, VPS Node 22…) | Application | toutes |
| PostgreSQL managé, région UE, sauvegardes automatiques | Données | `DATABASE_URL` |
| Stripe (compte vérifié) | Paiements | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Stockage S3 (R2, Scaleway…) : 1 bucket privé + 1 bucket public/CDN | Fichiers | `STORAGE_*` |
| Resend + domaine vérifié (SPF, DKIM, DMARC) | E-mails | `RESEND_API_KEY`, `EMAIL_FROM` |
| Nom de domaine | HTTPS | `APP_URL` |

## Procédure de mise en production

1. Créer la base de production ; renseigner toutes les variables chez l'hébergeur (secrets **différents** de la préproduction).
2. Build : la base doit être joignable pendant `next build` (pages publiques prérendues).
3. Commande de build recommandée : `npm run db:deploy && npm run build`.
4. Premier déploiement : `npm run db:seed` avec `SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD`, puis retirer `SEED_OWNER_PASSWORD` des variables.
5. Stripe : créer le point de terminaison webhook `https://<domaine>/api/webhooks/stripe` (phase 3), copier le secret de signature.
6. Compléter *Administration › Paramètres*, publier les pages légales validées, activer et tarifer les modes de livraison.
7. Passer `commerce.checkoutEnabled` à vrai uniquement après une commande réelle de test remboursée.
8. Vérifier : HTTPS, redirection www, en-têtes de sécurité, `robots.txt`, `sitemap.xml`, e-mails reçus (et non en spam).

## Sauvegardes et restauration

- **Base** : sauvegardes automatiques quotidiennes + restauration à un instant donné (PITR) chez le fournisseur ; rétention ≥ 30 jours. Export logique hebdomadaire hors fournisseur :
  ```bash
  pg_dump "$DATABASE_URL" --format=custom --file=gc3d-$(date +%F).dump
  ```
- **Fichiers** : versionnement d'objets activé sur le bucket privé ; réplication ou copie hebdomadaire vers un second fournisseur.
- **Test de restauration** trimestriel sur une base jetable :
  ```bash
  pg_restore --clean --no-owner --dbname "$RESTORE_URL" gc3d-AAAA-MM-JJ.dump
  ```
- Les factures doivent être conservées 10 ans (obligation comptable) : ne jamais purger `Invoice` ni les PDF associés.

## Journaux et surveillance

- Journaux JSON sur la sortie standard (niveau, message, contexte masqué) : les brancher sur l'outil de l'hébergeur.
- Surveiller : erreurs 5xx, `EmailLog` en `FAILED`, webhooks Stripe en échec (tableau Stripe), espace disque du stockage.
- Recommandé : une sonde de disponibilité (UptimeRobot, Better Stack) sur `/` et `/connexion`.

## Rotation des secrets

`BETTER_AUTH_SECRET` (déconnecte tout le monde), clés Stripe, clés de stockage : à renouveler en cas de départ d'un intervenant ou de suspicion de fuite.

## Préproduction actuelle (novembre 2026)

- Hébergement : projet Vercel `gc3d-boutique`, déployé depuis la branche `boutique` du dépôt `gc3d-site`.
- Base : schéma PostgreSQL isolé `gc3d` dans le projet Supabase `focus-fonciere` (offre gratuite limitée à 2 projets). Rôle dédié `gc3d_app`, propriétaire du seul schéma `gc3d`, sans accès aux tables des autres applications ; schéma non exposé par l'API Supabase.
- Variables : `DATABASE_SCHEMA=gc3d`, `DATABASE_POOL_MAX=3`, `DATABASE_URL` via le pooler Supabase en mode session (port 5432, `sslmode=require`).
- Construction : `npm run vercel-build` = migrations Prisma → données initiales (idempotentes) → build Next.js.
- **Avant l'ouverture des ventes** : migrer vers un projet de base dédié avec sauvegardes (Supabase Pro ou autre), via `pg_dump --schema=gc3d` puis restauration.
