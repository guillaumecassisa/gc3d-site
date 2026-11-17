import "server-only";
import { z } from "zod";

/**
 * Variables d'environnement serveur, validées au démarrage.
 * Les services externes (Stripe, stockage, e-mail) sont optionnels en
 * développement : leur absence désactive proprement la fonctionnalité
 * correspondante (voir `isConfigured`) au lieu de la simuler.
 */
const optional = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),
  /// Schéma PostgreSQL de l'application (permet d'isoler GC3D dans une base partagée).
  DATABASE_SCHEMA: z.string().regex(/^[a-z_][a-z0-9_]*$/).default("public"),
  /// Connexions max par instance (bases mutualisées / offres gratuites : rester bas).
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(50).default(5),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET doit faire au moins 32 caractères"),

  STRIPE_SECRET_KEY: optional,
  STRIPE_WEBHOOK_SECRET: optional,

  STORAGE_ENDPOINT: optional,
  STORAGE_REGION: z.string().default("auto"),
  STORAGE_ACCESS_KEY_ID: optional,
  STORAGE_SECRET_ACCESS_KEY: optional,
  STORAGE_PRIVATE_BUCKET: optional,
  STORAGE_PUBLIC_BUCKET: optional,
  STORAGE_PUBLIC_BASE_URL: optional,

  RESEND_API_KEY: optional,
  EMAIL_FROM: optional,
  /// Destinataire des alertes internes (nouvelle commande, devis...).
  STAFF_NOTIFICATION_EMAIL: optional,

  /// Sel pour hacher les adresses IP (journaux, anti-spam) — jamais d'IP en clair.
  IP_HASH_SALT: z.string().min(16).default("dev-only-ip-hash-salt-change-me"),
});

export type Env = z.infer<typeof schema>;

function load(): Env {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Configuration invalide :\n${issues}`);
  }
  if (parsed.data.NODE_ENV === "production" && parsed.data.IP_HASH_SALT.startsWith("dev-only")) {
    throw new Error("IP_HASH_SALT doit être défini en production.");
  }
  return parsed.data;
}

export const env = load();

export const isConfigured = {
  stripe: Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET),
  storage: Boolean(env.STORAGE_ACCESS_KEY_ID && env.STORAGE_SECRET_ACCESS_KEY && env.STORAGE_PRIVATE_BUCKET),
  email: Boolean(env.RESEND_API_KEY && env.EMAIL_FROM),
} as const;
