import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db/client";

/** Étiquettes de cache du catalogue (invalidées par l'administration). */
export const CATALOG_TAG = "catalog";

/** Produits visibles publiquement : actifs, publiés, jamais de démonstration en production. */
export function publicProductWhere() {
  return {
    status: "ACTIVE" as const,
    ...(process.env.NODE_ENV === "production" ? { isDemo: false } : {}),
  };
}

export async function getTechnologies() {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  return db.technology.findMany({
    where: { active: true },
    orderBy: { position: "asc" },
    select: { id: true, code: true, slug: true, name: true, shortName: true, description: true, imageUrl: true },
  });
}

export async function getTechnologyWithCategories(slug: string) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  return db.technology.findFirst({
    where: { slug, active: true },
    include: {
      categories: {
        where: { status: "VISIBLE", parentId: null },
        orderBy: { position: "asc" },
        include: { _count: { select: { products: { where: publicProductWhere() } } } },
      },
    },
  });
}

export async function getFeaturedProducts(limit = 8) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("minutes");
  return db.product.findMany({
    where: { ...publicProductWhere(), featured: true },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    take: limit,
    select: {
      id: true,
      slug: true,
      name: true,
      basePriceCents: true,
      compareAtPriceCents: true,
      currency: true,
      saleMode: true,
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true, alt: true } },
    },
  });
}
