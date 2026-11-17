import Link from "next/link";
import { LEGAL_NAV, MAIN_NAV } from "@/config/navigation";
import { getTechnologies } from "@/features/catalog/queries";
import { getSetting } from "@/features/settings/service";
import { Logo } from "./logo";

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  pinterest: "Pinterest",
  etsy: "Etsy",
};

export async function SiteFooter() {
  const [company, branding, social, technologies] = await Promise.all([
    getSetting("company"),
    getSetting("branding"),
    getSetting("social"),
    getTechnologies(),
  ]);
  const socials = Object.entries(social).filter(([, url]) => Boolean(url)) as [string, string][];
  const address = company.showAddressPublicly
    ? [company.addressLine1, company.addressLine2, [company.postalCode, company.city].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <footer className="bg-surface-dark text-surface-dark-foreground">
      <div className="container-gc grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
        <div className="space-y-4">
          <Logo variant="horizontal" tone="light" height={44} />
          <p className="max-w-xs text-sm leading-relaxed text-white/70">{branding.footerDescription}</p>
          {socials.length > 0 ? (
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Réseaux sociaux">
              {socials.map(([key, url]) => (
                <li key={key}>
                  <a href={url} rel="noopener noreferrer" target="_blank" className="text-white/80 hover:text-white">
                    {SOCIAL_LABELS[key] ?? key}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <FooterColumn title="Navigation">
          {MAIN_NAV.filter((i) => i.enabled).map((i) => (
            <FooterLink key={i.href} href={i.href}>
              {i.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Technologies">
          {technologies.map((t) => (
            <FooterLink key={t.id} href={`/${t.slug}`}>
              {t.name}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Informations">
          {company.publicEmail ? (
            <li>
              <a href={`mailto:${company.publicEmail}`} className="text-sm text-white/80 hover:text-white">
                {company.publicEmail}
              </a>
            </li>
          ) : null}
          {company.publicPhone ? (
            <li>
              <a
                href={`tel:${company.publicPhone.replace(/\s/g, "")}`}
                className="text-sm text-white/80 hover:text-white"
              >
                {company.publicPhone}
              </a>
            </li>
          ) : null}
          {address ? <li className="text-sm text-white/70">{address}</li> : null}
          {LEGAL_NAV.map((l) => (
            <FooterLink key={l.href} href={l.href}>
              {l.label}
            </FooterLink>
          ))}
        </FooterColumn>
      </div>
      <div className="border-t border-white/10">
        <div className="container-gc flex flex-col gap-2 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {company.tradeName} — Impression 3D &amp; produits personnalisés</p>
          <p>Site sans traceur publicitaire ni mesure d&apos;audience à ce jour.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">{title}</h2>
      <ul className="grid gap-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-white/80 transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}
