/**
 * Données initiales de référence (pas de produits, pas de prix, pas d'avis).
 */
export const TECHNOLOGIES = [
  {
    code: "LASER_ENGRAVING",
    slug: "gravure-laser",
    name: "Gravure laser",
    shortName: "Laser",
    description: "Personnalisation d'objets, plaques, cadeaux et accessoires.",
    seoTitle: "Gravure laser personnalisée",
    categories: [
      "Porte-clés",
      "Plaques",
      "Cadeaux personnalisés",
      "Objets en bois",
      "Ardoises",
      "Trophées",
      "Signalétique",
      "Articles pour événements",
      "Objets professionnels",
    ],
  },
  {
    code: "LASER_CUTTING",
    slug: "decoupe-laser",
    name: "Découpe laser",
    shortName: "Découpe",
    description: "Fabrication de formes, décorations et pièces personnalisées.",
    seoTitle: "Découpe laser sur mesure",
    categories: [
      "Décorations",
      "Lettres",
      "Prénoms",
      "Formes personnalisées",
      "Supports",
      "Plaques",
      "Pièces techniques",
      "Découpe sur mesure",
    ],
  },
  {
    code: "UV_PRINTING",
    slug: "impression-uv",
    name: "Impression UV",
    shortName: "UV",
    description: "Impression couleur sur supports compatibles.",
    seoTitle: "Impression UV personnalisée",
    categories: [
      "Plaques couleur",
      "Objets personnalisés",
      "Cadeaux photo",
      "Supports publicitaires",
      "Signalétique",
      "Logos d'entreprise",
      "Impression sur mesure",
    ],
  },
  {
    code: "PRINTING_3D",
    slug: "impression-3d",
    name: "Impression 3D",
    shortName: "3D",
    description: "Fabrication d'objets, prototypes et pièces personnalisées.",
    seoTitle: "Impression 3D à la demande",
    categories: [
      "Objets décoratifs",
      "Accessoires",
      "Supports",
      "Prototypes",
      "Pièces fonctionnelles",
      "Objets créatifs",
      "Fabrication sur mesure",
    ],
  },
] as const;

/** Matériaux effectivement travaillés par l'atelier (à compléter dans l'admin). */
export const MATERIALS = [
  { slug: "pla", name: "PLA", technologies: ["PRINTING_3D"] },
  { slug: "petg", name: "PETG", technologies: ["PRINTING_3D"] },
  { slug: "tpu", name: "TPU (flexible)", technologies: ["PRINTING_3D"] },
  { slug: "bois-tilleul", name: "Bois de tilleul", technologies: ["LASER_ENGRAVING", "LASER_CUTTING", "UV_PRINTING"] },
  { slug: "bois-hetre", name: "Bois de hêtre", technologies: ["LASER_ENGRAVING"] },
  { slug: "ardoise", name: "Ardoise", technologies: ["LASER_ENGRAVING", "UV_PRINTING"] },
] as const;

export const LEGAL_PAGES = [
  { slug: "mentions-legales", title: "Mentions légales" },
  { slug: "cgv", title: "Conditions générales de vente" },
  { slug: "confidentialite", title: "Politique de confidentialité" },
  { slug: "cookies", title: "Politique de cookies" },
  { slug: "livraison-retours", title: "Livraison et retours" },
  { slug: "droit-de-retractation", title: "Droit de rétractation" },
  { slug: "garanties-reclamations", title: "Garanties et réclamations" },
] as const;

export const LEGAL_DRAFT_NOTICE =
  "> **Brouillon à faire valider par un professionnel du droit avant publication.**\n>\n> Les passages entre crochets [À COMPLÉTER] dépendent de la situation réelle de GC3D.\n";

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
