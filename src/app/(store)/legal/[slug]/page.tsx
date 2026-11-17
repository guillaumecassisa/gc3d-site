import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/content/markdown";
import { LEGAL_NAV } from "@/config/navigation";
import { getSitePage } from "@/features/content/queries";

type Props = { params: Promise<{ slug: string }> };

const SLUGS = LEGAL_NAV.map((l) => l.href.replace("/legal/", ""));

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getSitePage((await params).slug);
  if (!page) return {};
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? undefined,
    robots: page.published ? undefined : { index: false },
  };
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  if (!SLUGS.includes(slug)) notFound();
  const page = await getSitePage(slug);
  if (!page || page.type !== "LEGAL") notFound();

  return (
    <div className="container-gc max-w-3xl py-12 sm:py-16">
      {page.published ? (
        <>
          <Markdown>{page.content}</Markdown>
          <p className="text-muted-foreground mt-10 text-xs">
            Dernière mise à jour : {page.updatedAt.toLocaleDateString("fr-FR", { dateStyle: "long" })}
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
          <p className="bg-muted text-muted-foreground mt-6 rounded-xl border p-6 text-sm">
            Ce document est en cours de rédaction et de validation. Il sera publié avant l&apos;ouverture des ventes en
            ligne.
          </p>
        </>
      )}
    </div>
  );
}
