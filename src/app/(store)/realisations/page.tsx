import type { Metadata } from "next";
import { getTechnologies } from "@/features/catalog/queries";
import { getPublishedPortfolio } from "@/features/content/queries";
import { RealisationsGrid } from "./grid";

export const metadata: Metadata = {
  title: "Nos réalisations",
  description: "Créations GC3D en gravure laser, découpe laser, impression UV et impression 3D.",
  alternates: { canonical: "/realisations" },
};

export default async function RealisationsPage() {
  const [projects, technologies] = await Promise.all([getPublishedPortfolio(), getTechnologies()]);

  return (
    <div className="container-gc py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Nos réalisations</h1>
      <p className="text-muted-foreground mt-3 max-w-2xl">
        Une sélection de pièces fabriquées à l&apos;atelier. Les projets clients ne sont publiés qu&apos;avec leur
        accord.
      </p>

      {projects.length === 0 ? (
        <p className="bg-muted text-muted-foreground mt-10 rounded-xl border p-8 text-center text-sm">
          Aucune réalisation n&apos;est encore publiée.
        </p>
      ) : (
        <RealisationsGrid
          technologies={technologies.map((t) => ({ slug: t.slug, label: t.shortName }))}
          projects={projects.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            technologySlug: p.technology?.slug ?? null,
            technologyName: p.technology?.name ?? null,
            image: p.images[0] ? { url: p.images[0].url, alt: p.images[0].alt } : null,
          }))}
        />
      )}
    </div>
  );
}
