"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type PortfolioCard = {
  id: string;
  slug: string;
  title: string;
  technologySlug: string | null;
  technologyName: string | null;
  image: { url: string; alt: string } | null;
};

/** Grille filtrable par technologie (Laser, Découpe, UV, 3D). */
export function RealisationsGrid({
  projects,
  technologies,
}: {
  projects: PortfolioCard[];
  technologies: { slug: string; label: string }[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const visible = active ? projects.filter((p) => p.technologySlug === active) : projects;
  const filters = [{ slug: null as string | null, label: "Toutes" }, ...technologies];

  return (
    <div className="mt-8">
      <div role="group" aria-label="Filtrer par technologie" className="flex flex-wrap gap-2">
        {filters.map((t) => (
          <button
            key={t.slug ?? "all"}
            type="button"
            aria-pressed={active === t.slug}
            onClick={() => setActive(t.slug)}
            className={cn(
              "h-9 rounded-full border px-4 text-sm font-medium transition-colors",
              active === t.slug ? "border-foreground bg-foreground text-background" : "hover:bg-muted",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {visible.length} réalisation(s) affichée(s)
      </p>
      {visible.length === 0 ? (
        <p className="text-muted-foreground mt-8 text-sm">Aucune réalisation publiée pour cette technologie.</p>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {visible.map((p) => (
            <li key={p.id}>
              <Link href={`/realisations/${p.slug}`} className="group block overflow-hidden rounded-xl border">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- URL CDN administrable
                  <img
                    src={p.image.url}
                    alt={p.image.alt}
                    className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                ) : null}
                <div className="p-4">
                  <p className="text-sm font-semibold">{p.title}</p>
                  {p.technologyName ? <p className="text-muted-foreground text-xs">{p.technologyName}</p> : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
