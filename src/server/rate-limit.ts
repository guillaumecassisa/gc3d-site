import "server-only";
import { db, table } from "@/lib/db/client";

/**
 * Limiteur à fenêtre fixe persisté en base (fonctionne avec plusieurs instances
 * serveur). Opération atomique : un seul UPSERT.
 */
export async function consumeRateLimit(
  key: string,
  max: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO ${table("RateLimit")} AS rl ("id", "key", "count", "lastRequest")
    VALUES (${crypto.randomUUID()}, ${`app:${key}`}, 1, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN rl."lastRequest" < ${windowStart} THEN 1 ELSE rl."count" + 1 END,
      "lastRequest" = CASE WHEN rl."lastRequest" < ${windowStart} THEN ${now} ELSE rl."lastRequest" END
    RETURNING "count"`;
  const count = Number(rows[0]?.count ?? max + 1);
  return { allowed: count <= max, remaining: Math.max(0, max - count) };
}
