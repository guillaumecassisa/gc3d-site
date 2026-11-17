import { z } from "zod";
import { logger } from "@/lib/logger";

/**
 * Gestion centralisée des erreurs.
 * Les actions serveur renvoient un `ActionResult` : jamais de pile d'appels
 * ni de détail technique côté navigateur.
 */
export type ErrorCode =
  | "VALIDATION"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "NOT_CONFIGURED"
  | "INTERNAL";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export type ActionResult<T = void> =
  { ok: true; data: T } | { ok: false; code: ErrorCode; message: string; fieldErrors?: Record<string, string[]> };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof AppError) {
    return { ok: false, code: error.code, message: error.message, fieldErrors: error.fieldErrors };
  }
  if (error instanceof z.ZodError) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "Certains champs sont invalides.",
      fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[]>,
    };
  }
  // Les redirections / notFound de Next.js doivent être relancées.
  if (error && typeof error === "object" && "digest" in error) throw error;
  logger.error("Erreur inattendue", { error });
  return { ok: false, code: "INTERNAL", message: "Une erreur inattendue est survenue. Réessayez." };
}

/** Enveloppe une action serveur : validation + gestion d'erreurs uniforme. */
export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return ok(await fn());
  } catch (error) {
    return toActionError(error);
  }
}
