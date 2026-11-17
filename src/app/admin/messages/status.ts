import type { ContactStatus } from "@/generated/prisma/enums";

export const MESSAGE_STATUS: Record<
  ContactStatus,
  { label: string; variant: "accent" | "warning" | "success" | "neutral" | "danger" }
> = {
  NEW: { label: "Nouveau", variant: "accent" },
  IN_PROGRESS: { label: "En cours", variant: "warning" },
  ANSWERED: { label: "Répondu", variant: "success" },
  CLOSED: { label: "Clos", variant: "neutral" },
  SPAM: { label: "Indésirable", variant: "danger" },
};
