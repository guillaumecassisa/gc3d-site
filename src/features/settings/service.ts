import "server-only";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db/client";
import { logger } from "@/lib/logger";
import { recordAudit } from "@/server/audit";
import { DEFAULT_SETTINGS, SETTINGS, type SettingKey, type SettingValue } from "./schema";

export const settingsTag = (key: SettingKey) => `settings:${key}`;

/**
 * Lit un paramètre (mis en cache, invalidé à chaque modification).
 * Une valeur stockée invalide retombe sur la valeur par défaut et est signalée.
 */
export async function getSetting<K extends SettingKey>(key: K): Promise<SettingValue<K>> {
  "use cache";
  cacheTag(settingsTag(key));
  cacheLife("hours");
  const row = await db.siteSetting.findUnique({ where: { key } });
  if (!row) return DEFAULT_SETTINGS[key];
  const parsed = SETTINGS[key].safeParse(row.value);
  if (!parsed.success) {
    logger.warn("Paramètre invalide en base, valeur par défaut utilisée", { key });
    return DEFAULT_SETTINGS[key];
  }
  return parsed.data as SettingValue<K>;
}

export async function updateSetting<K extends SettingKey>(
  key: K,
  input: unknown,
  actorId: string,
): Promise<SettingValue<K>> {
  const value = SETTINGS[key].parse(input) as SettingValue<K>;
  await db.siteSetting.upsert({
    where: { key },
    create: { key, value: value as Prisma.InputJsonValue, updatedById: actorId },
    update: { value: value as Prisma.InputJsonValue, updatedById: actorId },
  });
  await recordAudit({ actorId, action: "settings.update", entityType: "SiteSetting", entityId: key });
  updateTag(settingsTag(key));
  return value;
}

/** Champs légaux obligatoires encore manquants (affichés dans l'admin). */
export function missingLegalFields(company: SettingValue<"company">): string[] {
  const required: [keyof typeof company, string][] = [
    ["legalName", "Nom et prénom de l'entrepreneur"],
    ["siret", "SIRET"],
    ["addressLine1", "Adresse professionnelle"],
    ["postalCode", "Code postal"],
    ["city", "Ville"],
    ["publicEmail", "E-mail de contact"],
    ["publicationDirector", "Directeur de la publication"],
    ["hostName", "Hébergeur"],
    ["mediatorName", "Médiateur de la consommation"],
  ];
  return required.filter(([k]) => !company[k]).map(([, label]) => label);
}
