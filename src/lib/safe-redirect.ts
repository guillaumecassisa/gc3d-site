/** Protège contre les redirections ouvertes : seuls les chemins internes sont acceptés. */
export function safeRedirectPath(value: string | null | undefined, fallback = "/compte"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  try {
    const url = new URL(value, "http://interne.local");
    if (url.origin !== "http://interne.local") return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
