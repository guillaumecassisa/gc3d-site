import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { escapeHtml, renderEmail } from "@/lib/email/layout";
import { _redactForTests } from "@/lib/logger";

describe("safeRedirectPath (redirections ouvertes)", () => {
  it("accepte les chemins internes", () => {
    expect(safeRedirectPath("/compte/commandes?page=2")).toBe("/compte/commandes?page=2");
  });
  it("refuse les URL externes et les astuces de contournement", () => {
    for (const bad of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", ""]) {
      expect(safeRedirectPath(bad)).toBe("/compte");
    }
    expect(safeRedirectPath(null, "/")).toBe("/");
  });
});

describe("e-mails", () => {
  it("échappe le contenu dynamique", () => {
    expect(escapeHtml(`<script>"x"&'y'</script>`)).toBe("&lt;script&gt;&quot;x&quot;&amp;&#39;y&#39;&lt;/script&gt;");
    const { html, text } = renderEmail({
      appUrl: "https://gc3d.test",
      preheader: "p",
      title: "Bonjour <b>",
      blocks: [{ type: "paragraph", text: "<img src=x onerror=1>" }],
    });
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x onerror=1&gt;");
    expect(text).toContain("Bonjour <b>");
  });
});

describe("journalisation", () => {
  it("masque les champs sensibles", () => {
    const out = _redactForTests({ email: "a@b.c", password: "x", nested: { apiKey: "k", stripeToken: "t" } }) as Record<
      string,
      unknown
    >;
    expect(out.password).toBe("[masqué]");
    expect((out.nested as Record<string, unknown>).apiKey).toBe("[masqué]");
    expect((out.nested as Record<string, unknown>).stripeToken).toBe("[masqué]");
    expect(out.email).toBe("a@b.c");
  });
});
