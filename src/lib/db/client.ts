import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";
import { pgConnectionConfig } from "./connection";

/**
 * Client Prisma unique (réutilisé entre rechargements à chaud en développement).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaPg(
    { ...pgConnectionConfig(env.DATABASE_URL), max: env.DATABASE_POOL_MAX },
    { schema: env.DATABASE_SCHEMA },
  );
  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["$transaction"]>[0]>[0];

/** Nom de table qualifié par le schéma, pour les rares requêtes SQL brutes. */
export function table(name: string) {
  if (!/^[A-Za-z_]+$/.test(name)) throw new Error("Nom de table invalide");
  return Prisma.raw(`"${env.DATABASE_SCHEMA}"."${name}"`);
}
