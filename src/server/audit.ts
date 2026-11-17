import "server-only";
import { createHash } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import { db, type Tx } from "@/lib/db/client";
import { env } from "@/lib/env";

/** Empreinte d'adresse IP (jamais stockée en clair). */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return createHash("sha256").update(`${env.IP_HASH_SALT}:${ip}`).digest("hex").slice(0, 32);
}

export async function recordAudit(
  entry: {
    actorId: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    data?: Prisma.InputJsonValue;
    ip?: string | null;
  },
  tx: Tx | typeof db = db,
) {
  await tx.auditLog.create({
    data: {
      actorId: entry.actorId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      data: entry.data ?? {},
      ipHash: hashIp(entry.ip),
    },
  });
}
