import "server-only";
import { db } from "@/lib/db/client";
import { isConfigured } from "@/lib/env";
import { getSetting, missingLegalFields } from "@/features/settings/service";

export type ReadinessItem = { label: string; ok: boolean; detail?: string };

/**
 * Liste de contrôle « prêt pour la production » affichée sur le tableau de bord.
 * Elle reflète l'état réel de la configuration, sans rien supposer.
 */
export async function getReadiness(): Promise<ReadinessItem[]> {
  const [company, legalPages, activeShipping, ownerCount] = await Promise.all([
    getSetting("company"),
    db.sitePage.findMany({
      where: { type: "LEGAL" },
      select: { title: true, published: true, legalValidatedAt: true },
    }),
    db.shippingMethod.count({ where: { active: true } }),
    db.user.count({ where: { role: "OWNER" } }),
  ]);
  const missing = missingLegalFields(company);
  const unpublished = legalPages.filter((p) => !p.published).map((p) => p.title);

  return [
    {
      label: "Informations légales de l'entreprise",
      ok: missing.length === 0,
      detail: missing.length ? `À compléter : ${missing.join(", ")}` : undefined,
    },
    {
      label: "Pages légales publiées et validées",
      ok: unpublished.length === 0,
      detail: unpublished.length ? `Non publiées : ${unpublished.join(", ")}` : undefined,
    },
    {
      label: "Paiement Stripe configuré",
      ok: isConfigured.stripe,
      detail: isConfigured.stripe ? undefined : "STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET",
    },
    {
      label: "Stockage de fichiers configuré",
      ok: isConfigured.storage,
      detail: isConfigured.storage ? undefined : "Variables STORAGE_*",
    },
    {
      label: "E-mails transactionnels configurés",
      ok: isConfigured.email,
      detail: isConfigured.email ? undefined : "RESEND_API_KEY / EMAIL_FROM",
    },
    { label: "Au moins un mode de livraison actif", ok: activeShipping > 0 },
    { label: "Administrateur principal défini", ok: ownerCount > 0 },
  ];
}
