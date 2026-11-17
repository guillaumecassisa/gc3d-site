import "server-only";
import { Resend } from "resend";
import { db } from "@/lib/db/client";
import { env, isConfigured } from "@/lib/env";
import { logger } from "@/lib/logger";
import { renderEmail, type EmailBlock } from "./layout";

let client: Resend | null = null;
function resend(): Resend {
  client ??= new Resend(env.RESEND_API_KEY);
  return client;
}

export type SendEmailInput = {
  to: string;
  template: string;
  subject: string;
  preheader?: string;
  blocks: EmailBlock[];
  related?: { type: string; id: string };
  /** Empêche un double envoi (ex: "order-confirmation:<id>"). */
  dedupeKey?: string;
};

/**
 * Envoie un e-mail transactionnel et l'enregistre dans EmailLog.
 * Sans fournisseur configuré, l'envoi est journalisé SKIPPED (jamais simulé
 * comme envoyé).
 */
export async function sendEmail(
  input: SendEmailInput,
): Promise<{ status: "SENT" | "FAILED" | "SKIPPED" | "DUPLICATE" }> {
  if (input.dedupeKey) {
    const existing = await db.emailLog.findUnique({ where: { dedupeKey: input.dedupeKey } });
    if (existing && existing.status === "SENT") return { status: "DUPLICATE" };
  }

  const log = await db.emailLog.upsert({
    where: { dedupeKey: input.dedupeKey ?? `nodedupe:${crypto.randomUUID()}` },
    create: {
      to: input.to,
      template: input.template,
      subject: input.subject,
      relatedType: input.related?.type,
      relatedId: input.related?.id,
      dedupeKey: input.dedupeKey,
    },
    update: { attempts: { increment: 0 } },
  });

  if (!isConfigured.email) {
    await db.emailLog.update({
      where: { id: log.id },
      data: { status: "SKIPPED", error: "Fournisseur e-mail non configuré (RESEND_API_KEY / EMAIL_FROM)" },
    });
    logger.warn("E-mail non envoyé : fournisseur non configuré", { template: input.template });
    return { status: "SKIPPED" };
  }

  const { html, text } = renderEmail({
    appUrl: env.APP_URL,
    preheader: input.preheader ?? input.subject,
    title: input.subject,
    blocks: input.blocks,
  });

  try {
    const res = await resend().emails.send({
      from: env.EMAIL_FROM!,
      to: input.to,
      subject: input.subject,
      html,
      text,
    });
    if (res.error) throw new Error(res.error.message);
    await db.emailLog.update({
      where: { id: log.id },
      data: { status: "SENT", providerId: res.data?.id, sentAt: new Date(), attempts: { increment: 1 }, error: null },
    });
    return { status: "SENT" };
  } catch (error) {
    await db.emailLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message.slice(0, 500) : "inconnue",
        attempts: { increment: 1 },
      },
    });
    logger.error("Échec d'envoi d'e-mail", { template: input.template, error });
    return { status: "FAILED" };
  }
}
