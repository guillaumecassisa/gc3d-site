import { describe, expect, it } from "vitest";
import { canAssignRole, hasPermission, isStaff, PERMISSIONS, ROLE_PERMISSIONS } from "@/lib/permissions";

describe("permissions", () => {
  it("un client n'a aucune permission d'administration", () => {
    for (const p of PERMISSIONS) expect(hasPermission("CUSTOMER", p)).toBe(false);
    expect(isStaff("CUSTOMER")).toBe(false);
  });

  it("l'administrateur principal a toutes les permissions", () => {
    for (const p of PERMISSIONS) expect(hasPermission("OWNER", p)).toBe(true);
  });

  it("l'opérateur de fabrication ne gère ni remboursements, ni paramètres, ni équipe", () => {
    expect(hasPermission("PRODUCTION_OPERATOR", "production:write")).toBe(true);
    expect(hasPermission("PRODUCTION_OPERATOR", "orders:refund")).toBe(false);
    expect(hasPermission("PRODUCTION_OPERATOR", "settings:write")).toBe(false);
    expect(hasPermission("PRODUCTION_OPERATOR", "staff:manage")).toBe(false);
  });

  it("le gestionnaire boutique ne gère pas l'équipe ni les paramètres", () => {
    expect(hasPermission("SHOP_MANAGER", "catalog:write")).toBe(true);
    expect(hasPermission("SHOP_MANAGER", "staff:manage")).toBe(false);
    expect(hasPermission("SHOP_MANAGER", "settings:write")).toBe(false);
  });

  it("les rôles inconnus ou absents n'ont aucun droit", () => {
    expect(hasPermission(null, "admin:access")).toBe(false);
    expect(hasPermission(undefined, "admin:access")).toBe(false);
  });

  it("tout rôle du personnel peut accéder à l'administration", () => {
    for (const role of ["OWNER", "SHOP_MANAGER", "PRODUCTION_OPERATOR", "SUPPORT"] as const) {
      expect(ROLE_PERMISSIONS[role]).toContain("admin:access");
    }
  });

  it("seul l'administrateur principal attribue des rôles", () => {
    expect(canAssignRole("OWNER", "OWNER")).toBe(true);
    expect(canAssignRole("OWNER", "SUPPORT")).toBe(true);
    expect(canAssignRole("SHOP_MANAGER", "SUPPORT")).toBe(false);
    expect(canAssignRole("SUPPORT", "CUSTOMER")).toBe(false);
  });
});
