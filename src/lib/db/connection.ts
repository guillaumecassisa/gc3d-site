/**
 * Configuration du pilote `pg` à partir de DATABASE_URL (partagée par
 * l'application et le script de données initiales).
 * `sslmode=require` (sémantique libpq : chiffré, sans vérification de la chaîne)
 * est traduit explicitement, `pg` l'interprétant sinon comme `verify-full`.
 * Les commandes Prisma CLI lisent l'URL telle quelle.
 */
export function pgConnectionConfig(databaseUrl: string) {
  const url = new URL(databaseUrl);
  const mode = url.searchParams.get("sslmode");
  url.searchParams.delete("sslmode");
  const ssl =
    mode === "require" || mode === "prefer" ? { rejectUnauthorized: false } : mode === "verify-full" ? true : undefined;
  return { connectionString: url.toString(), ssl };
}
