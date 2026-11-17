/**
 * Contrôle d'accès par rôle (RBAC).
 * Source unique de vérité, appliquée côté serveur (actions, routes, pages).
 * L'interface peut masquer des boutons, mais ne décide jamais seule.
 */
import type { UserRole } from "@/generated/prisma/enums";

export const PERMISSIONS = [
  "admin:access",
  "dashboard:view",
  "catalog:read",
  "catalog:write",
  "pricing:write",
  "inventory:write",
  "orders:read",
  "orders:write",
  "orders:refund",
  "quotes:read",
  "quotes:write",
  "production:read",
  "production:write",
  "customers:read",
  "customers:write",
  "files:read",
  "shipping:write",
  "marketing:write",
  "reviews:moderate",
  "content:write",
  "messages:read",
  "messages:write",
  "invoices:read",
  "invoices:write",
  "settings:write",
  "staff:manage",
  "audit:read",
  "stats:read",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL: readonly Permission[] = PERMISSIONS;

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  OWNER: ALL,
  SHOP_MANAGER: ALL.filter((p) => p !== "staff:manage" && p !== "settings:write"),
  PRODUCTION_OPERATOR: [
    "admin:access",
    "dashboard:view",
    "catalog:read",
    "orders:read",
    "production:read",
    "production:write",
    "files:read",
  ],
  SUPPORT: [
    "admin:access",
    "dashboard:view",
    "catalog:read",
    "orders:read",
    "quotes:read",
    "customers:read",
    "files:read",
    "messages:read",
    "messages:write",
    "reviews:moderate",
    "invoices:read",
  ],
  CUSTOMER: [],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: "Administrateur principal",
  SHOP_MANAGER: "Gestionnaire boutique",
  PRODUCTION_OPERATOR: "Opérateur de fabrication",
  SUPPORT: "Support client",
  CUSTOMER: "Client",
};

export const STAFF_ROLES: readonly UserRole[] = ["OWNER", "SHOP_MANAGER", "PRODUCTION_OPERATOR", "SUPPORT"];

export function hasPermission(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function isStaff(role: UserRole | null | undefined): boolean {
  return role ? STAFF_ROLES.includes(role) : false;
}

/**
 * Un membre du personnel ne peut attribuer que des rôles « inférieurs ou égaux »
 * au sien, et seul l'administrateur principal gère le personnel.
 */
export function canAssignRole(actor: UserRole, target: UserRole): boolean {
  if (!hasPermission(actor, "staff:manage")) return false;
  return actor === "OWNER" || target !== "OWNER";
}
