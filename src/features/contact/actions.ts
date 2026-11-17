"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db/client";
import { env } from "@/lib/env";
import { AppError, runAction, type ActionResult } from "@/lib/errors";
import { sendEmail } from "@/lib/email/send";
import { getCurrentUser } from "@/lib/auth/session";
import { hashIp } from "@/server/audit";
import { notifyStaff } from "@/server/notifications";
import { consumeRateLimit } from "@/server/rate-limit";
import { CONTACT_SUBJECTS, contactSchema } from "./schema";

/**
 * Formulaire de contact : validation, anti-spam (pot de miel, délai minimal,
 * limitation par IP), enregistrement en base, notification de l'équipe et
 * accusé de réception.
 */
export async function submitContact(input: unknown): Promise<ActionResult<{ id: string | null }>> {
  return runAction(async () => {
    const data = contactSchema.parse(input);
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip");
    const ipHash = hashIp(ip);

    const limit = await consumeRateLimit(`contact:${ipHash ?? "unknown"}`, 3, 600);
    if (!limit.allowed) {
      throw new AppError("RATE_LIMITED", "Trop de messages envoyés. Réessayez dans quelques minutes.");
    }

    // Robots : on répond « succès » sans rien enregistrer (ne pas les renseigner).
    if (data.website || Date.now() - data.renderedAt < 3000) return { id: null };

    const user = await getCurrentUser();
    const message = await db.contactMessage.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        subject: CONTACT_SUBJECTS[data.subject],
        message: data.message,
        userId: user?.id ?? null,
        ipHash,
      },
    });

    await notifyStaff({
      type: "CONTACT_RECEIVED",
      title: `Nouveau message : ${CONTACT_SUBJECTS[data.subject]}`,
      body: `${data.name} — ${data.email}`,
      link: `/admin/messages/${message.id}`,
    });

    if (env.STAFF_NOTIFICATION_EMAIL) {
      await sendEmail({
        to: env.STAFF_NOTIFICATION_EMAIL,
        template: "staff-contact",
        subject: `[GC3D] ${CONTACT_SUBJECTS[data.subject]} — ${data.name}`,
        blocks: [
          { type: "paragraph", text: `${data.name} (${data.email}${data.phone ? `, ${data.phone}` : ""}) a écrit :` },
          { type: "paragraph", text: data.message },
          {
            type: "button",
            label: "Ouvrir dans l'administration",
            href: `${env.APP_URL}/admin/messages/${message.id}`,
          },
        ],
        related: { type: "contact", id: message.id },
      });
    }

    await sendEmail({
      to: message.email,
      template: "contact-acknowledgement",
      subject: "Nous avons bien reçu votre message",
      blocks: [
        { type: "paragraph", text: `Bonjour ${data.name},` },
        {
          type: "paragraph",
          text: "Merci pour votre message. Nous l'avons bien reçu et vous répondrons dans les meilleurs délais.",
        },
        { type: "small", text: "Ceci est un accusé de réception automatique." },
      ],
      related: { type: "contact", id: message.id },
      dedupeKey: `contact-ack:${message.id}`,
    });

    return { id: message.id };
  });
}
