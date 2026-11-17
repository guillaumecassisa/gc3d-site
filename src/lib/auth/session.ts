import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@/generated/prisma/enums";
import { AppError } from "@/lib/errors";
import { hasPermission, isStaff, type Permission } from "@/lib/permissions";
import { auth } from "./auth";

/**
 * Couche d'accès aux sessions (Data Access Layer).
 * Toute vérification d'identité ou de droit passe par ces fonctions.
 */
export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  emailVerified: boolean;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const u = session.user as typeof session.user & {
    role?: UserRole;
    firstName?: string | null;
    lastName?: string | null;
    banned?: boolean | null;
  };
  if (u.banned) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    firstName: u.firstName ?? null,
    lastName: u.lastName ?? null,
    role: u.role ?? "CUSTOMER",
    emailVerified: u.emailVerified,
  };
});

/** Pages : redirige vers la connexion si besoin. */
export async function requireUserPage(returnTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?retour=${encodeURIComponent(returnTo)}`);
  return user;
}

/** Pages d'administration : connexion + permission. */
export async function requireStaffPage(permission: Permission, returnTo: string): Promise<CurrentUser> {
  const user = await requireUserPage(returnTo);
  if (!isStaff(user.role) || !hasPermission(user.role, permission)) redirect("/acces-refuse");
  return user;
}

/** Actions serveur / Route Handlers : lève une AppError. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("UNAUTHENTICATED", "Veuillez vous connecter.");
  return user;
}

export async function requirePermission(permission: Permission): Promise<CurrentUser> {
  const user = await requireUser();
  if (!hasPermission(user.role, permission)) {
    throw new AppError("FORBIDDEN", "Vous n'avez pas les droits nécessaires pour cette action.");
  }
  return user;
}
