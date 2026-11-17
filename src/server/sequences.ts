import "server-only";
import { table, type Tx } from "@/lib/db/client";

/**
 * Numérotation continue des documents (commandes, devis, factures).
 * L'incrément se fait dans la transaction appelante avec un verrou de ligne
 * (UPSERT ... RETURNING) : pas de doublon ni de trou en cas de concurrence,
 * et si la transaction échoue, le numéro n'est pas consommé.
 */
export type SequenceKind = "order" | "quote" | "quoteRequest" | "invoice" | "creditNote" | "production";

export async function nextSequenceValue(tx: Tx, kind: SequenceKind, year: number): Promise<number> {
  const key = `${kind}:${year}`;
  const rows = await tx.$queryRaw<{ value: number }[]>`
    INSERT INTO ${table("DocumentSequence")} AS ds ("key", "nextValue", "updatedAt")
    VALUES (${key}, 2, NOW())
    ON CONFLICT ("key") DO UPDATE
      SET "nextValue" = ds."nextValue" + 1, "updatedAt" = NOW()
    RETURNING ds."nextValue" - 1 AS value`;
  const value = rows[0]?.value;
  if (typeof value !== "number") throw new Error(`Séquence ${key} indisponible`);
  return value;
}

export function formatDocumentNumber(prefix: string, year: number, value: number, pad = 4): string {
  return `${prefix}-${year}-${String(value).padStart(pad, "0")}`;
}
