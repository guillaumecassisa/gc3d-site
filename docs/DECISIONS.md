# Décisions à prendre

Points qui dépendent de GC3D et non du code. Pour chacun, une **hypothèse configurable** est déjà en place : rien ne bloque le développement, mais la mise en production attend une réponse.

## Bloquantes pour l'ouverture des ventes

1. **Articulation avec la boutique Shopify ouverte en octobre 2026 et avec Etsy.**
   Hypothèse : cette application devient la boutique principale ; Etsy reste un canal d'acquisition ; Shopify est arrêtée à l'ouverture. Les stocks ne sont **pas** synchronisés entre canaux (produits majoritairement fabriqués à la demande). À confirmer.
2. **Informations légales** : nom de l'entrepreneur, SIRET, adresse professionnelle (ou domiciliation), e-mail et téléphone publics, médiateur de la consommation (adhésion obligatoire pour vendre aux particuliers), hébergeur. → *Administration › Paramètres*.
3. **Régime de TVA** : franchise en base (art. 293 B) par défaut. Prévoir le basculement si le seuil de chiffre d'affaires est dépassé (paramètre `tax.vatMode`).
4. **Textes juridiques** (CGV, confidentialité, cookies, rétractation, garanties) : brouillons en base, non publiés. À rédiger/valider par un professionnel. Préciser **produit par produit** l'exception au droit de rétractation (art. L221-28 3° — biens nettement personnalisés) : champ `withdrawalExempt`, jamais global.
5. **Facturation** : la boutique émet-elle les factures (numérotation `FA-AAAA-00001` continue) ou un outil comptable externe s'en charge-t-il ? Hypothèse : la boutique les émet.
6. **Livraison** : transporteur(s), grille tarifaire (fixe / poids), seuil de gratuité, Corse et DOM. Méthodes créées mais **inactives** tant que les tarifs ne sont pas saisis. Point relais : uniquement après intégration d'un transporteur (Boxtal, Mondial Relay, Colissimo…). Retrait à l'atelier : uniquement si une adresse réelle est configurée.
7. **Comptes Stripe, stockage S3, Resend, domaine** : à ouvrir au nom de GC3D (liste dans DEPLOIEMENT.md).

## Non bloquantes (hypothèses retenues)

| Sujet | Hypothèse par défaut | Où la changer |
|---|---|---|
| Achat invité | Autorisé | `commerce.guestCheckoutEnabled` |
| Durée de validité d'un devis | 30 jours | `commerce.quoteValidityDays` |
| Réservation de stock pendant le paiement | 30 minutes | `commerce.stockReservationMinutes` |
| Taille maximale d'un fichier | 50 Mo | `commerce.maxUploadMb` |
| Formats acceptés | 3D : STL, OBJ, 3MF — laser/UV : SVG, PDF, PNG, JPG, DXF | Configuration du module |
| Vérification d'e-mail | Envoyée à l'inscription, non bloquante pour se connecter | `lib/auth/auth.ts` |
| Numérotation | `CMD-2026-00001`, `DEV-2026-0001`, `FA-2026-00001`, `AV-…` pour les avoirs | Paramètres `commerce` |
| Hébergement | Next.js sur Vercel ou équivalent (Node 22) + PostgreSQL managé UE (Neon, Scaleway, Supabase) | DEPLOIEMENT.md |
| Stockage | Cloudflare R2 (pas de frais de sortie) ou Scaleway (France) | Variables `STORAGE_*` |
| Analytics | Aucun traceur tant qu'aucun outil n'est choisi ; si ajouté : bandeau de consentement CNIL et `ConsentRecord` | Phase 8 |
| Antivirus des fichiers | Contrôle du type réel + formats restreints ; analyse antivirus si l'infrastructure le permet (ex. ClamAV) | Phase 5 |
| Couleur d'accent | Orange #FF7426 (le doré évoqué auparavant n'est pas retenu dans ce cahier des charges) | `globals.css` |

## Décisions techniques prises

- **Better Auth** plutôt qu'Auth.js (v5 encore en bêta).
- **Prisma 7** avec adaptateur `pg` (pas de moteur binaire à l'exécution).
- **Rôles en énumération + permissions en code** (testées), plutôt qu'en table.
- **Cache Components activé** : pages publiques prérendues, zones authentifiées en streaming derrière `Suspense`.
- **Pas de cache de session côté cookie** : sécurité des changements de rôle avant la micro-optimisation.
- **Composants UI écrits au format shadcn** (registre non joignable pendant le développement initial).
