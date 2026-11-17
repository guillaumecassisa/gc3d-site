import { describe, expect, it } from "vitest";
import { contactSchema } from "@/features/contact/schema";
import { DEFAULT_SETTINGS, SETTINGS, companySettingsSchema } from "@/features/settings/schema";

const valid = {
  name: "Jeanne Martin",
  email: "jeanne@example.com",
  subject: "projet",
  message: "Bonjour, je souhaite une plaque gravée.",
  consent: true,
  renderedAt: 1_700_000_000_000,
};

describe("formulaire de contact", () => {
  it("accepte une demande valide", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });
  it("exige le consentement", () => {
    expect(contactSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });
  it("rejette un pot de miel rempli", () => {
    expect(contactSchema.safeParse({ ...valid, website: "http://spam" }).success).toBe(false);
  });
  it("rejette un objet inconnu et un e-mail invalide", () => {
    expect(contactSchema.safeParse({ ...valid, subject: "hack" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, email: "pas-un-email" }).success).toBe(false);
  });
});

describe("paramètres", () => {
  it("les valeurs par défaut respectent leurs schémas", () => {
    for (const [key, schema] of Object.entries(SETTINGS)) {
      expect(schema.safeParse(DEFAULT_SETTINGS[key as keyof typeof SETTINGS]).success, key).toBe(true);
    }
  });
  it("aucune coordonnée n'est inventée par défaut", () => {
    const c = DEFAULT_SETTINGS.company;
    expect([c.siret, c.addressLine1, c.publicPhone, c.publicEmail, c.openingHours]).toEqual([
      null,
      null,
      null,
      null,
      null,
    ]);
  });
  it("valide le SIRET (14 chiffres, espaces tolérés)", () => {
    const base = { ...DEFAULT_SETTINGS.company };
    expect(companySettingsSchema.parse({ ...base, siret: "123 456 789 00012" }).siret).toBe("12345678900012");
    expect(companySettingsSchema.safeParse({ ...base, siret: "123" }).success).toBe(false);
    expect(companySettingsSchema.parse({ ...base, siret: "" }).siret).toBeNull();
  });
  it("la franchise de TVA est le mode par défaut", () => {
    expect(DEFAULT_SETTINGS.tax.vatMode).toBe("FRANCHISE");
    expect(DEFAULT_SETTINGS.tax.defaultRateBps).toBe(0);
    expect(DEFAULT_SETTINGS.commerce.checkoutEnabled).toBe(false);
  });
});
