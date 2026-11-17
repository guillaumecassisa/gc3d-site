import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db/client";
import { CONTENT_TAG } from "@/features/content/queries";

type Props = { params: Promise<{ slug: string }> };

async function getProject(slug: string) {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  return db.portfolioProject.findFirst({
    where: { slug, published: true, clientConsent: true },
    include: { images: { orderBy: { position: "asc" } }, technology: { select: { name: true, slug: true } } },
  });
}

export async function generateStaticParams() {
  const rows = await db.portfolioProject.findMany({
    where: { published: true, clientConsent: true },
    select: { slug: true },
  });
  // Au moins un paramètre est requis pour valider la route au build.
  return rows.length > 0 ? rows : [{ slug: "__aucune__" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return {};
  return {
    title: project.seoTitle ?? project.title,
    description: project.seoDescription ?? project.description?.slice(0, 160),
    alternates: { canonical: `/realisations/${project.slug}` },
  };
}

export default async function RealisationPage({ params }: Props) {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  return (
    <article className="container-gc py-12 sm:py-16">
      <Link href="/realisations" className="text-muted-foreground hover:text-foreground text-sm">
        ← Toutes les réalisations
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{project.title}</h1>
      {project.technology ? (
        <p className="text-muted-foreground mt-2 text-sm font-medium">{project.technology.name}</p>
      ) : null}
      {project.description ? (
        <p className="mt-6 max-w-3xl leading-relaxed whitespace-pre-line">{project.description}</p>
      ) : null}
      {project.fabricationInfo ? (
        <section className="bg-muted mt-8 max-w-3xl rounded-xl p-6">
          <h2 className="font-semibold">Fabrication</h2>
          <p className="text-muted-foreground mt-2 text-sm whitespace-pre-line">{project.fabricationInfo}</p>
        </section>
      ) : null}
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {project.images.map((img) => (
          <li key={img.id}>
            {/* eslint-disable-next-line @next/next/no-img-element -- URL CDN administrable */}
            <img src={img.url} alt={img.alt} className="w-full rounded-xl border object-cover" loading="lazy" />
          </li>
        ))}
      </ul>
    </article>
  );
}
