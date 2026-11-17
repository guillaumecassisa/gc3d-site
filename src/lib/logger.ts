/**
 * Journalisation structurée (JSON sur stdout/stderr, exploitable par tout
 * hébergeur). Les clés sensibles sont masquées automatiquement.
 */
type Level = "debug" | "info" | "warn" | "error";

const SENSITIVE = /pass(word)?|secret|token|authorization|cookie|card|iban|api[_-]?key/i;

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== "object") return value;
  if (value instanceof Error) return { name: value.name, message: value.message, stack: value.stack };
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [
      k,
      SENSITIVE.test(k) ? "[masqué]" : redact(v, depth + 1),
    ]),
  );
}

function write(level: Level, message: string, context?: Record<string, unknown>) {
  if (level === "debug" && process.env.NODE_ENV === "production") return;
  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    message,
    ...(context ? { context: redact(context) } : {}),
  });
  if (level === "error" || level === "warn") console.error(line);
  else console.log(line);
}

export const logger = {
  debug: (m: string, c?: Record<string, unknown>) => write("debug", m, c),
  info: (m: string, c?: Record<string, unknown>) => write("info", m, c),
  warn: (m: string, c?: Record<string, unknown>) => write("warn", m, c),
  error: (m: string, c?: Record<string, unknown>) => write("error", m, c),
};

export { redact as _redactForTests };
