# Feuille de route et état d'avancement

Légende (règle 8 du cahier des charges) : ✅ développé et testé · 🔧 développé, en attente de configuration · 🟡 partiel · ⬜ non développé

Une phase n'est validée que lorsque ses critères sont vérifiés par des tests, pas quand l'interface apparaît.

## Phase 1 — Fondations ✅ (17/11/2026)

| Élément | État | Vérification |
|---|---|---|
| Next.js 16, TypeScript strict, Tailwind 4, ESLint, Prettier | ✅ | `npm run check`, build de production |
| PostgreSQL + Prisma 7, schéma complet (70 tables), migration initiale | ✅ | Migration appliquée sur base vierge |
| Données initiales : 4 technologies, 31 catégories, 6 matériaux, paramètres, livraison inactive, brouillons légaux, administrateur | ✅ | Seed idempotent (relancé 2×) |
| Authentification : inscription, connexion, déconnexion, mot de passe oublié/réinitialisation, vérification d'e-mail, changement de mot de passe | ✅ / 🔧 | Parcours E2E ; les e-mails partent une fois Resend configuré |
| Rôles et permissions côté serveur (5 rôles) | ✅ | Tests unitaires + E2E (client refusé sur `/admin`) |
| Logos officiels, variantes clair/sombre, favicon, Apple Touch, icônes PWA, image de partage | ✅ | Contrôle visuel |
| Design system (variables CSS, Inter, composants) | ✅ | |
| Layouts : boutique (header, menu mobile, footer administrable), espace client, administration | ✅ | Captures mobile/ordinateur, aucun débordement horizontal |
| Pages : accueil, 4 pages technologies, réalisations (+ filtre, détail), contact, pages légales, 404, accès refusé | ✅ | |
| Formulaire de contact : Zod, pot de miel, délai minimal, limitation par IP, base, notification, e-mails | ✅ | E2E + test de limitation |
| Admin : tableau de bord (préparation à la production), messages, paramètres entreprise/identité/réseaux, équipe (rôles), journal d'audit | ✅ | E2E |
| Numérotation continue des documents | ✅ | Test de concurrence (25 transactions parallèles) |
| Sécurité : en-têtes, journaux masqués, IP hachées, anti-redirection ouverte | ✅ | Tests unitaires |
| Sitemap, robots, métadonnées, canoniques | ✅ | |

**Limites connues de la phase 1**
- Une URL inexistante à un seul segment (ex. `/abc`) affiche la page 404 avec `noindex` mais un code HTTP 200 (comportement du streaming Next.js) ; les vraies 404 HTTP restent assurées pour les autres chemins.
- Pièces jointes du formulaire de contact : arrivent avec le module de stockage (phase 4).

## Phase 2 — Boutique ⬜

Catalogue, pages catégories, fiches produits (galerie, zoom, variantes, prix dynamique), recherche avec suggestions (nom, description, référence, sans accents), filtres et tris, CRUD produits/catégories/variantes/matériaux en administration, upload d'images (CDN).

*Critères* : un produit créé dans l'admin apparaît après publication ; un brouillon/masqué/archivé/démo est invisible publiquement ; recherche et filtres testés ; Lighthouse mobile ≥ 90 sur accueil, catégorie, fiche.

## Phase 3 — E-commerce ⬜

Panier persistant (invité + fusion à la connexion), adresses, tunnel de commande, Stripe Checkout (test), webhooks signés et idempotents, commandes, réservation de stock, e-mails transactionnels, espace client (commandes, suivi, adresses, favoris), CSP à nonces.

*Critères* : prix recalculés serveur (test de falsification) ; paiement test de bout en bout ; webhook rejoué deux fois → un seul traitement ; paiement échoué → stock libéré ; une commande n'est payée que par webhook.

## Phase 4 — Personnalisation ⬜

Options produits, moteur de règles tarifaires administrables, upload sécurisé (type réel, taille, noms aléatoires, URL signées), aperçu 2D (texte, police, image, déplacement/rotation/échelle dans une zone délimitée), conservation historique de la configuration.

*Critères* : configuration incomplète → achat impossible ; prix identique client/serveur sur un jeu de cas ; ancienne commande inchangée après modification du produit ; fichier privé inaccessible sans droit.

## Phase 5 — Sur mesure ⬜

Demandes de devis (générique, 3D, gravure, découpe, UV), visualiseur 3D (STL/OBJ/3MF, dimensions, volume indicatif), contrôle de résolution des visuels UV, éditeur de devis versionné, PDF, acceptation/refus, paiement, conversion unique en commande.

## Phase 6 — Fabrication ⬜

Tableau de production (filtres Laser/Découpe/UV/3D, priorités, dates), fiches et bons de fabrication, actions démarrer/pause/terminer/problème/contrôlé, historique, notifications, frise de suivi client alimentée par les évènements réels.

## Phase 7 — Administration avancée ⬜

Statistiques (périodes), promotions, stocks et mouvements, factures et avoirs PDF, bons de livraison, B2B (validation des comptes pro, tarifs dégressifs), contenus (FAQ, bannières, réalisations, pages, SEO), avis vérifiés et modération, newsletter double opt-in.

## Phase 8 — Finalisation ⬜

SEO (données structurées, pages d'activité), accessibilité WCAG 2.2 AA sur parcours essentiels (audit axe), tests E2E des 15 scénarios du cahier des charges, revue de sécurité, mesures Core Web Vitals réelles, conformité (consentement cookies si analytics), préproduction, procédure de mise en production.
