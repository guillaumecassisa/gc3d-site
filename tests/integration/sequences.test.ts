import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import { formatDocumentNumber, nextSequenceValue } from "@/server/sequences";
import { consumeRateLimit } from "@/server/rate-limit";

beforeEach(async () => {
  await db.documentSequence.deleteMany({ where: { key: { startsWith: "test" } } });
  await db.rateLimit.deleteMany({ where: { key: { startsWith: "app:test" } } });
});
afterAll(async () => {
  await db.$disconnect();
});

describe("numérotation des documents", () => {
  it("produit une suite continue sans doublon sous concurrence", async () => {
    const values = await Promise.all(
      Array.from({ length: 25 }, () => db.$transaction((tx) => nextSequenceValue(tx, "quote", 1999))),
    );
    expect([...values].sort((a, b) => a - b)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
    await db.documentSequence.delete({ where: { key: "quote:1999" } });
  });

  it("ne consomme pas de numéro si la transaction échoue", async () => {
    await expect(
      db.$transaction(async (tx) => {
        await nextSequenceValue(tx, "invoice", 1998);
        throw new Error("échec simulé");
      }),
    ).rejects.toThrow();
    const v = await db.$transaction((tx) => nextSequenceValue(tx, "invoice", 1998));
    expect(v).toBe(1);
    await db.documentSequence.delete({ where: { key: "invoice:1998" } });
  });

  it("formate les numéros", () => {
    expect(formatDocumentNumber("DEV", 2026, 1)).toBe("DEV-2026-0001");
    expect(formatDocumentNumber("CMD", 2026, 42, 5)).toBe("CMD-2026-00042");
  });
});

describe("limitation de débit", () => {
  it("bloque au-delà du quota dans la fenêtre", async () => {
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await consumeRateLimit("test:ip", 3, 60));
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);
  });
});
