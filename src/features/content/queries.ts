import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db/client";

export const CONTENT_TAG = "content";

export async function getPublishedPortfolio(limit?: number, technologySlug?: string) {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  return db.portfolioProject.findMany({
    // Double garde : publié ET accord client enregistré.
    where: {
      published: true,
      clientConsent: true,
      ...(technologySlug ? { technology: { slug: technologySlug } } : {}),
    },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    take: limit,
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      technology: { select: { name: true, slug: true } },
    },
  });
}

export async function getHomeFaqs() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  return db.faq.findMany({
    where: { published: true, showOnHome: true, scope: "GLOBAL" },
    orderBy: { position: "asc" },
    take: 8,
  });
}

export async function getSitePage(slug: string) {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
  return db.sitePage.findUnique({ where: { slug } });
}
