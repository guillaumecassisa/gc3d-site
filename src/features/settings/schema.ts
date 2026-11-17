import { z } from "zod";

/**
 * Paramètres administrables du site. Chaque clé de SiteSetting est validée par
 * un schéma Zod : une mauvaise saisie ne peut pas casser la boutique.
 * Les valeurs non renseignées restent `null` et sont signalées « à compléter »
 * dans l'administration — rien n'est inventé.
 */
const nullableText = z
  .string()
  .trim()
  .max(500)
  .transform((v) => (v === "" ? null : v))
  .nullable();

export const companySettingsSchema = z.object({
  tradeName: z.string().trim().min(1).max(80),
  legalName: nullableText,
  legalForm: nullableText,
  siret: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s/g, ""))
    .refine((v) => v === "" || /^\d{14}$/.test(v), "Le SIRET comporte 14 chiffres")
    .transform((v) => (v === "" ? null : v))
    .nullable(),
  apeCode: nullableText,
  vatNumber: nullableText,
  addressLine1: nullableText,
  addressLine2: nullableText,
  postalCode: nullableText,
  city: nullableText,
  country: z.string().length(2).default("FR"),
  publicEmail: z
    .union([z.email(), z.literal("")])
    .transform((v) => (v === "" ? null : v))
    .nullable(),
  publicPhone: nullableText,
  openingHours: nullableText,
  publicationDirector: nullableText,
  hostName: nullableText,
  hostAddress: nullableText,
  mediatorName: nullableText,
  mediatorUrl: nullableText,
  showAddressPublicly: z.boolean().default(false),
});
export type CompanySettings = z.infer<typeof companySettingsSchema>;

export const brandingSettingsSchema = z.object({
  slogan: z.string().trim().min(1).max(120),
  tagline: z.string().trim().min(1).max(120),
  heroTitle: z.string().trim().min(1).max(120),
  heroDescription: z.string().trim().min(1).max(400),
  footerDescription: z.string().trim().max(400),
});
export type BrandingSettings = z.infer<typeof brandingSettingsSchema>;

export const socialSettingsSchema = z.object({
  instagram: z.union([z.url(), z.literal("")]).nullable(),
  facebook: z.union([z.url(), z.literal("")]).nullable(),
  tiktok: z.union([z.url(), z.literal("")]).nullable(),
  linkedin: z.union([z.url(), z.literal("")]).nullable(),
  pinterest: z.union([z.url(), z.literal("")]).nullable(),
  etsy: z.union([z.url(), z.literal("")]).nullable(),
});
export type SocialSettings = z.infer<typeof socialSettingsSchema>;

export const taxSettingsSchema = z.object({
  /** FRANCHISE : micro-entreprise en franchise en base de TVA. */
  vatMode: z.enum(["FRANCHISE", "STANDARD"]),
  defaultRateBps: z.number().int().min(0).max(10_000),
  franchiseMention: z.string().trim().min(1).max(200),
  pricesIncludeTax: z.literal(true),
});
export type TaxSettings = z.infer<typeof taxSettingsSchema>;

export const commerceSettingsSchema = z.object({
  currency: z.literal("EUR"),
  /** Le paiement en ligne reste fermé tant qu'il n'est pas explicitement ouvert. */
  checkoutEnabled: z.boolean(),
  guestCheckoutEnabled: z.boolean(),
  quoteValidityDays: z.number().int().min(1).max(365),
  stockReservationMinutes: z
    .number()
    .int()
    .min(5)
    .max(24 * 60),
  maxUploadMb: z.number().int().min(1).max(200),
  orderNumberPrefix: z.string().regex(/^[A-Z]{2,5}$/),
  quoteNumberPrefix: z.string().regex(/^[A-Z]{2,5}$/),
  invoiceNumberPrefix: z.string().regex(/^[A-Z]{2,5}$/),
});
export type CommerceSettings = z.infer<typeof commerceSettingsSchema>;

export const SETTINGS = {
  company: companySettingsSchema,
  branding: brandingSettingsSchema,
  social: socialSettingsSchema,
  tax: taxSettingsSchema,
  commerce: commerceSettingsSchema,
} as const;

export type SettingKey = keyof typeof SETTINGS;
export type SettingValue<K extends SettingKey> = z.infer<(typeof SETTINGS)[K]>;

/** Valeurs initiales : uniquement des informations connues et vérifiables. */
export const DEFAULT_SETTINGS: { [K in SettingKey]: SettingValue<K> } = {
  company: {
    tradeName: "GC3D",
    legalName: null,
    legalForm: "Entrepreneur individuel (micro-entreprise)",
    siret: null,
    apeCode: "3290Z",
    vatNumber: null,
    addressLine1: null,
    addressLine2: null,
    postalCode: null,
    city: null,
    country: "FR",
    publicEmail: null,
    publicPhone: null,
    openingHours: null,
    publicationDirector: null,
    hostName: null,
    hostAddress: null,
    mediatorName: null,
    mediatorUrl: null,
    showAddressPublicly: false,
  },
  branding: {
    slogan: "IMPRESSION 3D & PRODUITS PERSONNALISÉS",
    tagline: "GC3D — Donnons forme à vos idées.",
    heroTitle: "GC3D — Donnons forme à vos idées.",
    heroDescription:
      "Gravure laser, découpe laser, impression UV et impression 3D. Découvrez des créations personnalisées et des solutions de fabrication sur mesure.",
    footerDescription:
      "Création, fabrication et personnalisation d'objets : gravure laser, découpe laser, impression UV et impression 3D.",
  },
  social: { instagram: null, facebook: null, tiktok: null, linkedin: null, pinterest: null, etsy: null },
  tax: {
    vatMode: "FRANCHISE",
    defaultRateBps: 0,
    franchiseMention: "TVA non applicable, art. 293 B du CGI",
    pricesIncludeTax: true,
  },
  commerce: {
    currency: "EUR",
    checkoutEnabled: false,
    guestCheckoutEnabled: true,
    quoteValidityDays: 30,
    stockReservationMinutes: 30,
    maxUploadMb: 50,
    orderNumberPrefix: "CMD",
    quoteNumberPrefix: "DEV",
    invoiceNumberPrefix: "FA",
  },
};
