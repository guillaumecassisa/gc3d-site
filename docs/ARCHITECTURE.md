# GC3D — Architecture technique

Version 1.0 — 17 novembre 2026 — Phase 1 (fondations)

## 1. Analyse du cahier des charges

Le cahier des charges décrit trois applications en une :

1. **Une boutique e-commerce** (catalogue, panier, paiement Stripe, commandes, espace client).
2. **Un outil de devis sur mesure** (dépôt de fichiers 3D / vectoriels / images, analyse indicative, proposition chiffrée versionnée, acceptation, paiement, conversion en commande).
3. **Un outil de production d'atelier** (file de fabrication par technologie, statuts, priorités, fiches de fabrication, historique).

Les points les plus structurants pour l'architecture :

| Exigence | Conséquence technique |
|---|---|
| Prix jamais confiés au navigateur | Moteur de prix pur côté serveur, recalcul systématique au panier et au paiement |
| Paiement confirmé uniquement par vérification serveur | Webhooks Stripe signés, idempotents (`ProcessedWebhookEvent`), état intermédiaire `PROCESSING` |
| Historique commercial figé | Instantanés (snapshots) JSON dans commandes, devis, factures ; jamais de jointure « vivante » pour un document émis |
| Factures conformes et non modifiables | Numérotation continue en transaction (`DocumentSequence`), avoirs (`CREDIT_NOTE`) pour toute correction |
| Fichiers clients privés | Bucket S3 privé, noms internes aléatoires, URL signées courtes, journal d'accès (`FileAccess`) |
| Paiement ≠ fabrication | Trois statuts distincts sur la commande : `status`, `paymentStatus`, `fulfillmentStatus` + `ProductionJob` séparé |
| Évolutivité (nouvelles machines, technologies) | `Technology` est une **table**, pas une énumération |
| Administration sans code | Paramètres clé/valeur validés par Zod (`SiteSetting`), contenus en base |
| Aucune fonctionnalité fictive | Drapeaux de modules (`src/config/navigation.ts`) : un lien n'apparaît que si le module est livré |

### Contexte réel pris en compte

- **GC3D est une micro-entreprise en franchise en base de TVA** (« TVA non applicable, art. 293 B du CGI »). Le moteur fiscal est conçu en deux modes : `FRANCHISE` (par défaut, taux 0, mention obligatoire sur devis et factures) et `STANDARD` (TVA collectée, taux par produit). Le passage de l'un à l'autre est un paramètre, pas un développement.
- Prix affichés « TTC » (= net en franchise) : c'est ce que paie le client particulier.
- Équipement connu : Bambu Lab X1C, Anycubic Kobra Max 2, xTool S1 / O1 / M2. Matériaux connus : PLA, PETG, TPU, bois de tilleul, hêtre, ardoise (pré-saisis, complétables).
- Ventes actuelles sur Etsy / eBay / Shopify : la nouvelle boutique devra coexister (voir DECISIONS.md, point 1).

## 2. Stack retenue

| Couche | Choix | Version | Justification |
|---|---|---|---|
| Framework | Next.js App Router, Cache Components activé | 16.4 | Rendu serveur + coquille statique (PPR) : pages publiques rapides, zones authentifiées en streaming |
| Langage | TypeScript `strict` | 5.x | |
| UI | Tailwind CSS 4 + composants style shadcn/ui sur primitives Radix | 4.3 | Le registre shadcn n'était pas joignable depuis l'environnement de développement : composants écrits à la main au même format (`components/ui`), compatibles avec `npx shadcn add` ultérieur |
| Formulaires | React Hook Form + Zod 4 | | Même schéma Zod côté client (confort) et serveur (sécurité) |
| Base de données | PostgreSQL 16 + Prisma 7 (driver adapter `pg`) | 7.10 | Migrations versionnées, client sans binaire natif à l'exécution |
| Authentification | Better Auth | 1.7 | Stable (Auth.js v5 toujours en bêta), sessions en base, rate limiting persistant, reset/vérification d'e-mail intégrés |
| Paiement | Stripe (Checkout + webhooks) | 23.x | Interface `PaymentProvider` pour ajouter d'autres prestataires |
| Stockage | S3 compatible (R2 / Scaleway / OVH / AWS) | AWS SDK v3 | Aucune dépendance à un hébergeur |
| E-mails | Resend | 6.x | Journal `EmailLog`, statut `SKIPPED` explicite si non configuré |
| 3D | Three.js + React Three Fiber | phase 5 | |
| Tests | Vitest (unitaires + intégration sur base dédiée) + Playwright (parcours) | 5.x | |

**Pourquoi pas Shopify ?** Le cahier des charges exige un configurateur sur mesure avec règles tarifaires, devis versionnés, suivi de fabrication et fichiers privés : c'est l'essentiel de la valeur et Shopify le couvre mal sans applications payantes. Voir DECISIONS.md, point 1, pour l'articulation avec la boutique Shopify ouverte en octobre.

## 3. Organisation du code

```
src/
  app/
    (store)/            Boutique publique : accueil, technologies, réalisations, contact, pages légales
    (auth)/             Connexion, inscription, mot de passe oublié / réinitialisation
    compte/             Espace client (barrière RequireUser)
    admin/              Back-office (barrière RequireStaff + permission par page)
    api/auth/[...all]/  Points d'entrée Better Auth
    manifest.ts, robots.ts, sitemap.ts, icon.png, apple-icon.png, favicon.ico
  components/
    ui/                 Design system (Button, Input, Field, Card, Badge, Alert)
    layout/             Header, footer, menu mobile, logo, navigation latérale
    auth/ admin/ content/
  features/             Logique métier par domaine (schémas Zod, requêtes, actions serveur)
    settings/ catalog/ content/ contact/ account/ admin/
    (à venir) cart/ orders/ quotes/ production/ customers/ payments/ shipping/ pricing/
  lib/
    auth/               Configuration Better Auth, client, couche d'accès session (DAL)
    db/                 Client Prisma unique
    email/              Gabarit + envoi journalisé
    permissions/        RBAC (source unique de vérité)
    env.ts errors.ts logger.ts money.ts safe-redirect.ts
  server/               Services transverses serveur : audit, séquences, notifications, rate limit
  config/navigation.ts  Navigation + drapeaux de modules livrés
  generated/prisma/     Client Prisma généré (non versionné)
  proxy.ts              Redirection optimiste des zones protégées (pas un contrôle d'accès)
prisma/
  schema.prisma  migrations/  seed.ts  seed-data.ts
tests/
  unit/  integration/  e2e/
docs/
```

### Séparation des responsabilités

- **Interface** (`app/`, `components/`) : affichage, aucun calcul de prix ni décision d'autorisation.
- **Validation** : schémas Zod dans `features/*/schema.ts`, partagés client/serveur.
- **Logique métier + accès aux données** : `features/*/actions.ts` (Server Actions) et `features/*/queries.ts`.
- **Services externes** : `lib/email`, `lib/stripe`, `lib/storage` (activés uniquement si configurés — `isConfigured`).
- **Événements** : `server/audit.ts` (journal), `server/notifications.ts` (notifications internes), tables d'évènements par domaine (`OrderEvent`, `QuoteEvent`, `ProductionEvent`, `ShipmentEvent`).

### Règles de sécurité appliquées dans le code

1. Toute action serveur commence par `requireUser()` / `requirePermission()` et valide son entrée avec Zod.
2. Les pages protégées sont rendues derrière une barrière serveur (`RequireUser`, `RequireStaff`) **et** revérifient leur permission.
3. Le `proxy.ts` ne fait qu'une redirection de confort ; il ne protège rien à lui seul.
4. Pas de cache de session dans le cookie : un changement de rôle ou une révocation s'applique immédiatement ; un changement de rôle ferme les sessions de la personne.
5. Erreurs : `runAction()` renvoie un résultat typé ; aucun détail technique n'atteint le navigateur. Les journaux masquent automatiquement les champs sensibles.
6. IP jamais stockées en clair (empreinte salée `IP_HASH_SALT`).
7. Redirections après connexion filtrées (`safeRedirectPath`) contre les redirections ouvertes.
8. En-têtes : `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS en production. Une CSP à nonces sera ajoutée avec Stripe (phase 3).

## 4. Modèle de données

70 tables, schéma complet dès la phase 1 (`prisma/schema.prisma`, commenté en français). Conventions :

- Montants en **centimes entiers** + devise ; taux en **points de base** (2000 = 20 %).
- Dimensions en mm, poids en grammes.
- Identifiants `cuid`, `createdAt` / `updatedAt` partout.
- Suppressions : `Restrict` sur ce qui est référencé par des documents commerciaux (catégorie d'un produit, matériau, commande d'une facture), `SetNull` sur les liens d'historique (produit supprimé → la ligne de commande garde son instantané), `Cascade` sur les sous-objets.

| Domaine | Tables principales |
|---|---|
| Identité | User, Session, Account, Verification, RateLimit, CompanyProfile, Address |
| Catalogue | Technology, Category (arborescente), Collection, Product, ProductImage, ProductVideo, ProductVariant, ProductOption, ProductOptionValue, Material, MaterialTechnology, ProductMaterial, RelatedProduct, PricingRule, Inventory, InventoryMovement |
| Commerce | Cart, CartItem, Coupon, CouponRedemption, Order, OrderItem, OrderItemCustomization, OrderEvent, Payment, Refund, ProcessedWebhookEvent |
| Livraison | ShippingZone, ShippingMethod, ShippingRate, Shipment, ShipmentEvent |
| Facturation | Invoice (factures + avoirs), DocumentSequence |
| Devis | QuoteRequest, Quote, QuoteVersion, QuoteItem, QuoteEvent |
| Production | ProductionJob, ProductionTask, ProductionEvent, ProductionNote |
| Fichiers | UploadedFile, FileAccess |
| Contenus | Review, PortfolioProject, PortfolioImage, Faq, SitePage, Banner, SiteSetting, Redirect, Favorite, NewsletterSubscriber |
| Communication | ContactMessage, Notification, EmailLog |
| Conformité | AuditLog, ConsentRecord, DataRequest, AnalyticsEvent |

Adaptations par rapport à la liste du cahier des charges :

- **Role / Permission** : les rôles sont une énumération sur `User`, les permissions une matrice en code (`lib/permissions`), testée unitairement. Plus sûr qu'une table modifiable (pas d'escalade de privilèges par erreur de saisie) ; une table pourra être introduite si des rôles personnalisés deviennent nécessaires.
- **CustomerProfile** : fusionné dans `User` (prénom, nom, téléphone, type de client) ; `CompanyProfile` reste séparé pour le B2B avec validation administrateur.
- **ProductPreview** : remplacé par `UploadedFile` de type `CUSTOMIZATION_PREVIEW` référencé depuis la ligne de panier / de commande.
- Ajouts : `DocumentSequence`, `ProcessedWebhookEvent`, `Redirect`, `DataRequest`, `AnalyticsEvent`, `NewsletterSubscriber`, `RateLimit`.

### Cycle de paiement et de stock (prévu phase 3)

```
Panier ──► Validation serveur (prix, stock, livraison)
        ──► Order PENDING_PAYMENT + réservation de stock (expire après N min)
        ──► Stripe Checkout
        ──► Webhook signé checkout.session.completed (idempotent)
              ├─ montant/devise == commande ? sinon alerte, pas de validation
              ├─ Payment PAID, Order PAID, stock réservé → vendu
              ├─ ProductionJob créés (un par ligne à fabriquer)
              └─ E-mails (dédupliqués) + notification interne
        ──► Webhook échec / expiration → réservation libérée, Order CANCELLED
```

## 5. Environnements

| | Développement | Préproduction | Production |
|---|---|---|---|
| Base | PostgreSQL local | Base managée dédiée | Base managée + sauvegardes PITR |
| Stripe | Clés test | Clés test | Clés live |
| Stockage | Buckets de dev | Buckets dédiés | Buckets dédiés |
| E-mails | Facultatif (journal `SKIPPED`) | Domaine de test | Domaine vérifié |
| Produits de démo | Autorisés (`isDemo`) | Autorisés | **Jamais affichés** (filtre serveur) |

Point de vigilance : avec Cache Components, les pages publiques sont prérendues au build, la base doit donc être joignable pendant `next build`.
