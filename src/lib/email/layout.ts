/**
 * Gabarit HTML des e-mails transactionnels, aux couleurs GC3D.
 * Tables + styles en ligne pour la compatibilité des clients de messagerie.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type EmailBlock =
  | { type: "paragraph"; text: string }
  | { type: "button"; label: string; href: string }
  | { type: "small"; text: string };

export function renderEmail(opts: { appUrl: string; preheader: string; title: string; blocks: EmailBlock[] }): {
  html: string;
  text: string;
} {
  const logo = `${opts.appUrl}/assets/branding/gc3d-logo-noir.png`;
  const body = opts.blocks
    .map((b) => {
      switch (b.type) {
        case "paragraph":
          return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#202124">${escapeHtml(b.text)}</p>`;
        case "small":
          return `<p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#6b7280">${escapeHtml(b.text)}</p>`;
        case "button":
          return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="background:#FF7426;border-radius:8px"><a href="${escapeHtml(b.href)}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#080808;text-decoration:none">${escapeHtml(b.label)}</a></td></tr></table>`;
      }
    })
    .join("");

  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(opts.title)}</title></head>
<body style="margin:0;padding:0;background:#F2F3F5;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif">
<span style="display:none;max-height:0;overflow:hidden">${escapeHtml(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F3F5;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:12px;overflow:hidden">
<tr><td style="padding:24px 28px;border-bottom:1px solid #E5E7EB"><img src="${logo}" alt="GC3D" width="160" style="display:block;height:auto"></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;color:#080808">${escapeHtml(opts.title)}</h1>
${body}
</td></tr>
<tr><td style="padding:18px 28px;background:#202124;color:#E5E7EB;font-size:12px">GC3D — Impression 3D &amp; produits personnalisés</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    opts.title,
    "",
    ...opts.blocks.map((b) => (b.type === "button" ? `${b.label} : ${b.href}` : b.text)),
    "",
    "GC3D — Impression 3D & produits personnalisés",
  ].join("\n");

  return { html, text };
}
