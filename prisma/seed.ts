/**
 * Initialisation de la base GC3D (idempotent : peut être relancé sans doublon).
 *
 *   npm run db:seed
 *
 * Crée : technologies, catégories, matériaux, paramètres par défaut,
 * zone de livraison France métropolitaine (méthodes INACTIVES tant que les
 * tarifs ne sont pas saisis), brouillons de pages légales non publiés, et le
 * compte administrateur principal si SEED_OWNER_EMAIL / SEED_OWNER_PASSWORD
 * sont définis.
 *
 * Aucun produit, prix, avis ou commande n'est créé.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";
import { DEFAULT_SETTINGS } from "../src/features/settings/schema";
import { LEGAL_DRAFT_NOTICE, LEGAL_PAGES, MATERIALS, TECHNOLOGIES, slugify } from "./seed-data";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }, { schema: process.env.DATABASE_SCHEMA ?? "public" }),
});

async function seedTechnologiesAndCategories() {
  for (const [ti, t] of TECHNOLOGIES.entries()) {
    const tech = await db.technology.upsert({
      where: { code: t.code },
      create: {
        code: t.code,
        slug: t.slug,
        name: t.name,
        shortName: t.shortName,
        description: t.description,
        seoTitle: t.seoTitle,
        position: ti,
      },
      update: {},
    });
    for (const [ci, name] of t.categories.entries()) {
      // Le slug inclut la technologie : « Plaques » existe en laser et en découpe.
      const slug = `${t.slug}-${slugify(name)}`;
      await db.category.upsert({
        where: { slug },
        create: { slug, name, technologyId: tech.id, position: ci },
        update: {},
      });
    }
  }
}

async function seedMaterials() {
  const techs = await db.technology.findMany();
  for (const [i, m] of MATERIALS.entries()) {
    const material = await db.material.upsert({
      where: { slug: m.slug },
      create: { slug: m.slug, name: m.name, position: i },
      update: {},
    });
    for (const code of m.technologies) {
      const tech = techs.find((t) => t.code === code);
      if (!tech) continue;
      await db.materialTechnology.upsert({
        where: { materialId_technologyId: { materialId: material.id, technologyId: tech.id } },
        create: { materialId: material.id, technologyId: tech.id },
        update: {},
      });
    }
  }
}

async function seedSettings() {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.siteSetting.upsert({
      where: { key },
      create: { key, value: value as Prisma.InputJsonValue },
      update: {},
    });
  }
}

async function seedShipping() {
  const existing = await db.shippingZone.findFirst({ where: { name: "France métropolitaine" } });
  if (existing) return;
  await db.shippingZone.create({
    data: {
      name: "France métropolitaine",
      countries: ["FR"],
      // Corse (20) exclue par défaut : tarifs différents à configurer si besoin.
      excludedPostalPrefixes: ["20", "97", "98"],
      methods: {
        create: [
          {
            name: "Livraison à domicile",
            type: "HOME_DELIVERY",
            pricingType: "FLAT",
            flatPriceCents: 0,
            active: false, // à activer après saisie du tarif réel
            description: "Tarif à définir dans Administration › Livraison.",
          },
          {
            name: "Point relais",
            type: "RELAY_POINT",
            pricingType: "FLAT",
            flatPriceCents: 0,
            requiresIntegration: true, // non proposé tant qu'un transporteur n'est pas intégré
            active: false,
          },
        ],
      },
    },
  });
}

async function seedLegalPages() {
  for (const page of LEGAL_PAGES) {
    await db.sitePage.upsert({
      where: { slug: page.slug },
      create: {
        slug: page.slug,
        title: page.title,
        type: "LEGAL",
        published: false,
        content: `${LEGAL_DRAFT_NOTICE}\n# ${page.title}\n\n[À COMPLÉTER]\n`,
      },
      update: {},
    });
  }
}

async function seedOwner() {
  const email = process.env.SEED_OWNER_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_OWNER_PASSWORD;
  if (!email || !password) {
    console.log("ℹ︎  SEED_OWNER_EMAIL / SEED_OWNER_PASSWORD non définis : aucun administrateur créé.");
    return;
  }
  if (password.length < 12) throw new Error("SEED_OWNER_PASSWORD doit faire au moins 12 caractères.");
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "OWNER") await db.user.update({ where: { id: existing.id }, data: { role: "OWNER" } });
    console.log(`✓ Administrateur principal : ${email} (existant)`);
    return;
  }
  const user = await db.user.create({
    data: {
      email,
      name: process.env.SEED_OWNER_NAME ?? "Administrateur GC3D",
      role: "OWNER",
      emailVerified: true,
    },
  });
  await db.account.create({
    data: {
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password: await hashPassword(password),
    },
  });
  console.log(`✓ Administrateur principal créé : ${email}`);
}

async function main() {
  await seedTechnologiesAndCategories();
  await seedMaterials();
  await seedSettings();
  await seedShipping();
  await seedLegalPages();
  await seedOwner();
  const [t, c, m] = await Promise.all([db.technology.count(), db.category.count(), db.material.count()]);
  console.log(`✓ ${t} technologies, ${c} catégories, ${m} matériaux.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
