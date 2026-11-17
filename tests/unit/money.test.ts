import { describe, expect, it } from "vitest";
import { applyBps, formatMoney, parseMoneyInput, roundHalfUp, vatIncluded } from "@/lib/money";

describe("money", () => {
  it("arrondit au demi supérieur sur des entiers", () => {
    expect(roundHalfUp(5, 2)).toBe(3);
    expect(roundHalfUp(4, 2)).toBe(2);
    expect(roundHalfUp(-5, 2)).toBe(-3);
    expect(() => roundHalfUp(1.5, 2)).toThrow();
  });

  it("applique un pourcentage en points de base", () => {
    expect(applyBps(1000, 1000)).toBe(100); // 10 % de 10,00 €
    expect(applyBps(999, 1500)).toBe(150); // 149,85 → 150
  });

  it("extrait la TVA incluse d'un prix TTC", () => {
    expect(vatIncluded(1200, 2000)).toBe(200); // 12,00 TTC à 20 % → 2,00 de TVA
    expect(vatIncluded(1000, 2000)).toBe(167); // 166,67 → 167
    expect(vatIncluded(1000, 0)).toBe(0); // franchise en base
  });

  it("formate en euros (fr-FR)", () => {
    expect(formatMoney(490).replace(/\s/g, " ")).toBe("4,90 €");
  });

  it("analyse une saisie monétaire", () => {
    expect(parseMoneyInput("12,5")).toBe(1250);
    expect(parseMoneyInput("4.90 €")).toBe(490);
    expect(parseMoneyInput("1 200")).toBe(120000);
    expect(parseMoneyInput("12,345")).toBeNull();
    expect(parseMoneyInput("abc")).toBeNull();
  });
});
