import Link from "next/link";
import { ArrowRight, Box, Building2, Layers, PenTool, Printer, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { FEATURES } from "@/config/navigation";
import { getFeaturedProducts, getTechnologies } from "@/features/catalog/queries";
import { getHomeFaqs, getPublishedPortfolio } from "@/features/content/queries";
import { getSetting } from "@/features/settings/service";
import { formatMoney } from "@/lib/money";

const TECH_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LASER_ENGRAVING: PenTool,
  LASER_CUTTING: Layers,
  UV_PRINTING: Printer,
  PRINTING_3D: Box,
};

const STEPS = [
  { title: "Choisir", text: "Un produit du catalogue ou votre propre projet." },
  { title: "Personnaliser", text: "Texte, couleurs, dimensions, logo ou fichier." },
  { title: "Commander", text: "Paiement sécurisé ou validation de devis." },
  { title: "Recevoir", text: "Fabrication à l'atelier, contrôle, expédition." },
];

export default async function HomePage() {
  const [branding, technologies, featured, portfolio, faqs] = await Promise.all([
    getSetting("branding"),
    getTechnologies(),
    getFeaturedProducts(8),
    getPublishedPortfolio(6),
    getHomeFaqs(),
  ]);

  const projectHref = FEATURES.customQuote ? "/sur-mesure" : "/contact?objet=projet";

  return (
    <>
      {/* Hero */}
      <section className="bg-surface-dark relative overflow-hidden text-white">
        <div className="container-gc grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:py-28">
          <div className="max-w-2xl">
            <p className="text-gc-orange mb-4 text-xs font-semibold tracking-[0.2em] uppercase">{branding.slogan}</p>
            <h1 className="text-4xl leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {branding.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              {branding.heroDescription}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="accent" size="lg">
                <Link href={FEATURES.shop ? "/boutique" : "#technologies"}>
                  {FEATURES.shop ? "Découvrir la boutique" : "Découvrir nos savoir-faire"}
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline-inverse" size="lg">
                <Link href={projectHref}>Créer mon projet</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden justify-center lg:flex" aria-hidden>
            <div className="bg-gc-orange/10 absolute inset-0 m-auto size-80 rounded-full blur-3xl" />
            <Logo variant="icon" tone="light" height={300} className="relative opacity-95" />
          </div>
        </div>
      </section>

      {/* Les quatre technologies */}
      <section id="technologies" className="container-gc py-16 sm:py-20">
        <SectionHeading eyebrow="Nos savoir-faire" title="Quatre technologies, un seul atelier" />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {technologies.map((t) => {
            const Icon = TECH_ICONS[t.code] ?? Box;
            return (
              <li key={t.id}>
                <Link
                  href={`/${t.slug}`}
                  className="group bg-background flex h-full flex-col rounded-xl border p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
                >
                  {t.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- URL administrable (CDN)
                    <img
                      src={t.imageUrl}
                      alt=""
                      className="mb-5 aspect-[4/3] w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="bg-muted mb-5 inline-flex size-12 items-center justify-center rounded-lg">
                      <Icon className="size-6" />
                    </span>
                  )}
                  <h3 className="text-lg font-semibold">{t.name}</h3>
                  <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">{t.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">
                    Explorer
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Produits populaires — uniquement s'il existe de vrais produits mis en avant */}
      {featured.length > 0 ? (
        <section className="bg-muted py-16 sm:py-20">
          <div className="container-gc">
            <SectionHeading eyebrow="Sélection" title="Produits populaires" />
            <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {featured.map((p) => (
                <li key={p.id} className="bg-background rounded-xl border p-3">
                  {p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0].url}
                      alt={p.images[0].alt}
                      className="aspect-square w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                  ) : null}
                  <p className="mt-3 text-sm font-medium">{p.name}</p>
                  <p className="text-sm font-semibold">
                    {p.saleMode === "QUOTE_ONLY" ? "Sur devis" : formatMoney(p.basePriceCents, p.currency)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Fabrication sur mesure */}
      <section className={featured.length > 0 ? "container-gc py-16 sm:py-20" : "container-gc pb-16 sm:pb-20"}>
        <div className="bg-background grid gap-8 overflow-hidden rounded-2xl border p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">Sur mesure</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Vous avez un fichier ou une idée ?</h2>
            <p className="text-muted-foreground mt-4">
              {FEATURES.customQuote
                ? "Décrivez votre projet et joignez vos fichiers (STL, 3MF, SVG, DXF, PDF, images). Nous étudions la faisabilité et vous adressons une proposition chiffrée avant toute fabrication."
                : "Décrivez votre projet : nous étudions la faisabilité et revenons vers vous avec une proposition avant toute fabrication."}
            </p>
            <Button asChild variant="primary" size="lg" className="mt-6">
              <Link href={projectHref}>
                <Upload aria-hidden />
                Décrire mon projet
              </Link>
            </Button>
          </div>
          <ul className="grid gap-3 text-sm">
            {[
              "Étude de faisabilité par l'atelier",
              "Devis détaillé avant fabrication",
              "Pièce unique ou petite série",
            ].map((item) => (
              <li key={item} className="bg-muted flex items-center gap-3 rounded-lg px-4 py-3">
                <span className="bg-accent size-2 rounded-full" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Fonctionnement */}
      <section className="bg-muted py-16 sm:py-20">
        <div className="container-gc">
          <SectionHeading eyebrow="Fonctionnement" title="Comment ça marche" />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="bg-background rounded-xl p-6">
                <span className="text-gc-orange text-sm font-bold">0{i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Réalisations — uniquement les projets publiés avec accord client */}
      {portfolio.length > 0 ? (
        <section className="container-gc py-16 sm:py-20">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading eyebrow="Atelier" title="Nos réalisations" />
            <Link href="/realisations" className="hidden text-sm font-semibold hover:underline sm:inline">
              Tout voir
            </Link>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
            {portfolio.map((p) => (
              <li key={p.id}>
                <Link href={`/realisations/${p.slug}`} className="block overflow-hidden rounded-xl border">
                  {p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0].url}
                      alt={p.images[0].alt}
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                  <p className="p-4 text-sm font-semibold">{p.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Professionnels */}
      <section className="bg-surface-dark py-16 text-white sm:py-20">
        <div className="container-gc grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl">
            <Building2 className="text-gc-orange mb-4 size-8" aria-hidden />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Entreprises, associations, collectivités</h2>
            <p className="mt-4 text-white/75">
              Objets publicitaires, plaques professionnelles, signalétique, trophées, prototypes et petites séries
              personnalisées à votre logo.
            </p>
          </div>
          <Button asChild variant="accent" size="lg">
            <Link href="/contact?objet=professionnel">Demander un échange</Link>
          </Button>
        </div>
      </section>

      {/* FAQ administrable */}
      {faqs.length > 0 ? (
        <section className="container-gc py-16 sm:py-20">
          <SectionHeading eyebrow="FAQ" title="Questions fréquentes" />
          <div className="mt-8 divide-y rounded-xl border">
            {faqs.map((f) => (
              <details key={f.id} className="group p-5">
                <summary className="cursor-pointer list-none font-semibold marker:hidden">{f.question}</summary>
                <p className="text-muted-foreground mt-3 text-sm whitespace-pre-line">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
    </div>
  );
}
