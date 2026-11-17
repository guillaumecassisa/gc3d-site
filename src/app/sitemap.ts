import type { MetadataRoute } from "next";
import { db } from "@/lib/db/client";
import { MAIN_NAV } from "@/config/navigation";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const [legal, portfolio] = await Promise.all([
    db.sitePage.findMany({ where: { published: true }, select: { slug: true, type: true, updatedAt: true } }),
    db.portfolioProject.findMany({
      where: { published: true, clientConsent: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);
  return [
    ...MAIN_NAV.filter((i) => i.enabled).map((i) => ({ url: `${base}${i.href === "/" ? "" : i.href}` })),
    ...legal
      .filter((p) => p.type === "LEGAL")
      .map((p) => ({ url: `${base}/legal/${p.slug}`, lastModified: p.updatedAt })),
    ...portfolio.map((p) => ({ url: `${base}/realisations/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
