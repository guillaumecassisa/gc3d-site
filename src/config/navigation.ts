/**
 * Navigation et disponibilité des modules.
 * Un lien n'apparaît que si le module correspondant est réellement livré :
 * aucun bouton ne mène à une fonctionnalité absente.
 * Passer un module à `true` uniquement après validation (voir docs/ROADMAP.md).
 */
export const FEATURES = {
  shop: false, // Phase 2 — catalogue, fiches produits
  search: false, // Phase 2
  favorites: false, // Phase 3
  cart: false, // Phase 3
  customQuote: false, // Phase 5 — « Sur mesure »
  portfolio: true,
  contact: true,
} as const;

export type NavItem = { label: string; href: string; enabled: boolean };

export const MAIN_NAV: NavItem[] = [
  { label: "Accueil", href: "/", enabled: true },
  { label: "Boutique", href: "/boutique", enabled: FEATURES.shop },
  { label: "Gravure laser", href: "/gravure-laser", enabled: true },
  { label: "Découpe laser", href: "/decoupe-laser", enabled: true },
  { label: "Impression UV", href: "/impression-uv", enabled: true },
  { label: "Impression 3D", href: "/impression-3d", enabled: true },
  { label: "Sur mesure", href: "/sur-mesure", enabled: FEATURES.customQuote },
  { label: "Réalisations", href: "/realisations", enabled: FEATURES.portfolio },
  { label: "Contact", href: "/contact", enabled: FEATURES.contact },
];

export const LEGAL_NAV = [
  { label: "Mentions légales", href: "/legal/mentions-legales" },
  { label: "CGV", href: "/legal/cgv" },
  { label: "Confidentialité", href: "/legal/confidentialite" },
  { label: "Cookies", href: "/legal/cookies" },
  { label: "Livraison et retours", href: "/legal/livraison-retours" },
  { label: "Droit de rétractation", href: "/legal/droit-de-retractation" },
  { label: "Garanties et réclamations", href: "/legal/garanties-reclamations" },
];

export const TECHNOLOGY_SLUGS = ["gravure-laser", "decoupe-laser", "impression-uv", "impression-3d"] as const;
