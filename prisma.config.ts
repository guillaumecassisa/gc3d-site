import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Les commandes Prisma (migrate, studio) ciblent le schéma DATABASE_SCHEMA
 * (par défaut « public »), comme l'application à l'exécution.
 */
function databaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL est requis");
  const schema = process.env.DATABASE_SCHEMA;
  if (!schema || schema === "public") return raw;
  const url = new URL(raw);
  url.searchParams.set("schema", schema);
  return url.toString();
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl(),
  },
});
