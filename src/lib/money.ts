/**
 * Calculs monétaires en centimes entiers (aucun flottant persisté).
 * Les taux sont exprimés en points de base : 2000 = 20 %.
 */

export const DEFAULT_CURRENCY = "EUR";

const formatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(cents: number, currency = DEFAULT_CURRENCY, locale = "fr-FR"): string {
  const key = `${locale}:${currency}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, { style: "currency", currency });
    formatters.set(key, f);
  }
  return f.format(cents / 100);
}

/** Arrondi « demi au supérieur » (règle commerciale usuelle), sur entiers. */
export function roundHalfUp(numerator: number, denominator: number): number {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator) || denominator <= 0) {
    throw new RangeError("roundHalfUp attend des entiers et un dénominateur positif");
  }
  const sign = numerator < 0 ? -1 : 1;
  const abs = Math.abs(numerator);
  return sign * Math.floor((abs * 2 + denominator) / (denominator * 2));
}

/** Applique un pourcentage (en points de base) à un montant en centimes. */
export function applyBps(cents: number, bps: number): number {
  return roundHalfUp(cents * bps, 10_000);
}

/**
 * Extrait la TVA incluse dans un montant TTC.
 * TVA = TTC × taux / (1 + taux)  →  en entiers : TTC × bps / (10000 + bps)
 */
export function vatIncluded(grossCents: number, rateBps: number): number {
  if (rateBps <= 0) return 0;
  return roundHalfUp(grossCents * rateBps, 10_000 + rateBps);
}

export function sum(values: readonly number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

/** Convertit une saisie utilisateur « 12,50 » / « 12.5 » en centimes. */
export function parseMoneyInput(input: string): number | null {
  const normalized = input.replace(/\s|€/g, "").replace(",", ".");
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [units, decimals = ""] = normalized.replace("-", "").split(".");
  const cents = Number(units) * 100 + Number(decimals.padEnd(2, "0"));
  return normalized.startsWith("-") ? -cents : cents;
}
