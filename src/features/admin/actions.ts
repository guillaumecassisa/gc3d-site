"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { UserRole, ContactStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db/client";
import { requirePermission } from "@/lib/auth/session";
import { AppError, runAction, type ActionResult } from "@/lib/errors";
import { canAssignRole } from "@/lib/permissions";
import { recordAudit } from "@/server/audit";
import { updateSetting } from "@/features/settings/service";
import type { SettingKey } from "@/features/settings/schema";

// ---------------------------------------------------------------- Notifications

export async function markAllNotificationsRead(): Promise<void> {
  await requirePermission("dashboard:view");
  await db.notification.updateMany({ where: { audience: "STAFF", readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/admin");
}

// ---------------------------------------------------------------- Messages

const messageStatusSchema = z.object({ id: z.string().min(1), status: z.enum(ContactStatus) });

export async function updateMessageStatus(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requirePermission("messages:write");
    const { id, status } = messageStatusSchema.parse(input);
    const before = await db.contactMessage.findUnique({ where: { id }, select: { status: true } });
    if (!before) throw new AppError("NOT_FOUND", "Message introuvable.");
    await db.contactMessage.update({ where: { id }, data: { status } });
    await recordAudit({
      actorId: actor.id,
      action: "message.status_change",
      entityType: "ContactMessage",
      entityId: id,
      data: { from: before.status, to: status },
    });
    revalidatePath("/admin/messages");
  });
}

// ---------------------------------------------------------------- Paramètres

const EDITABLE: SettingKey[] = ["company", "branding", "social"];

export async function saveSettings(key: SettingKey, input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requirePermission("settings:write");
    if (!EDITABLE.includes(key)) throw new AppError("FORBIDDEN", "Paramètre non modifiable ici.");
    await updateSetting(key, input, actor.id);
    revalidatePath("/", "layout");
  });
}

// ---------------------------------------------------------------- Équipe

const roleSchema = z.object({ email: z.email(), role: z.enum(UserRole) });

/**
 * Attribue un rôle à un compte existant (la personne crée d'abord son compte).
 * Garde-fous : seuls les détenteurs de staff:manage, on ne peut pas modifier
 * son propre rôle, et le dernier administrateur principal ne peut pas être rétrogradé.
 */
export async function setUserRole(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const actor = await requirePermission("staff:manage");
    const { email, role } = roleSchema.parse(input);
    const target = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!target)
      throw new AppError("NOT_FOUND", "Aucun compte avec cette adresse. La personne doit d'abord créer son compte.");
    if (target.id === actor.id) throw new AppError("FORBIDDEN", "Vous ne pouvez pas modifier votre propre rôle.");
    if (!canAssignRole(actor.role, role) || !canAssignRole(actor.role, target.role)) {
      throw new AppError("FORBIDDEN", "Vous ne pouvez pas attribuer ce rôle.");
    }
    await db.$transaction(async (tx) => {
      if (target.role === "OWNER" && role !== "OWNER") {
        const owners = await tx.user.count({ where: { role: "OWNER" } });
        if (owners <= 1) throw new AppError("CONFLICT", "Il doit rester au moins un administrateur principal.");
      }
      await tx.user.update({ where: { id: target.id }, data: { role } });
      // Les sessions existantes sont révoquées pour appliquer immédiatement les nouveaux droits.
      await tx.session.deleteMany({ where: { userId: target.id } });
      await recordAudit(
        {
          actorId: actor.id,
          action: "user.role_change",
          entityType: "User",
          entityId: target.id,
          data: { from: target.role, to: role },
        },
        tx,
      );
    });
    revalidatePath("/admin/equipe");
  });
}
