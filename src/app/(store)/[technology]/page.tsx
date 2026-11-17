import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FEATURES, TECHNOLOGY_SLUGS } from "@/config/navigation";
import { getTechnologyWithCategories } from "@/features/catalog/queries";
import { getPublishedPortfolio } from "@/features/content/queries";

type Props = { params: Promise<{ technology: string }> };

export function generateStaticParams() {
  return TECHNOLOGY_SLUGS.map((technology) => ({ technology }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { technology } = await params;
  const tech = await getTechnologyWithCategories(technology);
  if (!tech) return {};
  return {
    title: tech.seoTitle ?? tech.name,
    description: tech.seoDescription ?? tech.description ?? undefined,
    alternates: { canonical: `/${tech.slug}` },
  };
}

export default async function TechnologyPage({ params }: Props) {
  const { technology } = await params;
  const tech = await getTechnologyWithCategories(technology);
  if (!tech) notFound();
  const portfolio = await getPublishedPortfolio(6, tech.slug);
  const productCount = tech.categories.reduce((n, c) => n + c._count.products, 0);
  const projectHref = FEATURES.customQuote
    ? `/sur-mesure?technologie=${tech.slug}`
    : `/contact?objet=projet&technologie=${tech.slug}`;

  return (
    <>
      <section className="bg-muted border-b">
        <div className="container-gc py-12 sm:py-16">
          <nav aria-label="Fil d'Ariane" className="text-muted-foreground mb-4 text-sm">
            <ol className="flex gap-2">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Accueil
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-foreground">
                {tech.name}
              </li>
            </ol>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{tech.name}</h1>
          {tech.description ? <p className="text-muted-foreground mt-3 max-w-2xl text-lg">{tech.description}</p> : null}
          <Button asChild variant="accent" size="lg" className="mt-6">
            <Link href={projectHref}>
              Demander un devis
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      <section className="container-gc py-12 sm:py-16">
        <h2 className="text-xl font-semibold">Catégories</h2>
        {productCount === 0 ? (
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
            Le catalogue en ligne de cet atelier est en cours de constitution. Pour toute demande dès maintenant,
            décrivez votre projet : nous vous répondons avec une proposition.
          </p>
        ) : null}
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {tech.categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 rounded-lg border px-4 py-3">
              <span className="text-sm font-medium">{c.name}</span>
              {c._count.products > 0 ? (
                <span className="text-muted-foreground text-xs">{c._count.products}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {portfolio.length > 0 ? (
        <section className="container-gc pb-16">
          <h2 className="text-xl font-semibold">Réalisations en {tech.name.toLowerCase()}</h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
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
    </>
  );
}
