// Parcours de bout en bout (Phase 1). Prérequis : serveur lancé, base initialisée, Chrome installé.
// E2E_ADMIN_PASSWORD=... node tests/e2e/smoke.mjs
import { mkdirSync } from "node:fs";
mkdirSync("test-results", { recursive: true });
import { chromium } from "playwright-core";
const B = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@gc3d.test";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "";
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const log = (...a) => console.log(...a);
const shot = async (page, name) => page.screenshot({ path: `test-results/${name}.png`, fullPage: true });

// Desktop + mobile home
for (const [name, vp] of [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
]) {
  const ctx = await browser.newContext({ viewport: vp, locale: "fr-FR" });
  const p = await ctx.newPage();
  await p.goto(B + "/");
  await shot(p, `home-${name}`);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  log(name, "overflow horizontal:", overflow);
  if (name === "mobile") {
    await p.getByRole("button", { name: "Ouvrir le menu" }).click();
    await p.waitForTimeout(300);
    await p.screenshot({ path: "test-results/menu-mobile.png" });
    await p.keyboard.press("Escape");
  }
  await p.goto(B + "/gravure-laser");
  await shot(p, `tech-${name}`);
  await p.goto(B + "/contact");
  await shot(p, `contact-${name}`);
  await ctx.close();
}

// Contact form (attendre > 3 s : délai anti-robot)
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(B + "/contact?objet=projet");
  await p.getByRole("button", { name: "Envoyer le message" }).click();
  log("erreurs affichées:", await p.getByRole("alert").count());
  await p.getByLabel("Nom").fill("Test E2E");
  await p.getByLabel("E-mail").fill("e2e@example.com");
  await p.getByLabel("Message").fill("Bonjour, ceci est un test de bout en bout.");
  await p.getByRole("checkbox").check();
  await p.waitForTimeout(3200);
  await p.getByRole("button", { name: "Envoyer le message" }).click();
  await p.getByText("Message envoyé").waitFor({ timeout: 10000 });
  log("contact: envoyé");
  await ctx.close();
}

// Inscription client puis tentative d'accès admin
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(B + "/inscription");
  await p.getByLabel("Prénom").fill("Claire");
  await p.getByLabel("Nom", { exact: true }).fill("Client");
  await p.getByLabel("E-mail").fill(`client${Date.now()}@example.com`);
  await p.getByLabel("Mot de passe", { exact: true }).fill("MotDePasse-Solide-1");
  await p.getByLabel("Confirmation du mot de passe").fill("MotDePasse-Solide-1");
  await p.getByRole("checkbox").check();
  await p.getByRole("button", { name: "Créer mon compte" }).click();
  await p.waitForURL(/\/compte/, { timeout: 15000 });
  await p.getByRole("heading", { name: "Bonjour Claire" }).waitFor();
  await shot(p, "compte-client");
  log("inscription + espace client: ok");
  await p.goto(B + "/admin");
  await p.waitForURL(/acces-refuse/, { timeout: 10000 });
  log("client → /admin :", new URL(p.url()).pathname);
  await ctx.close();
}

// Connexion administrateur
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(B + "/admin");
  await p.waitForURL(/connexion/);
  await p.getByLabel("E-mail").fill(ADMIN_EMAIL);
  await p.getByLabel("Mot de passe").fill("mauvais-mot-de-passe");
  await p.getByRole("button", { name: "Se connecter" }).click();
  await p.getByText("E-mail ou mot de passe incorrect.").waitFor();
  log("mauvais mot de passe: refusé");
  await p.getByLabel("Mot de passe").fill(ADMIN_PASSWORD);
  await p.getByRole("button", { name: "Se connecter" }).click();
  await p.waitForURL(B + "/admin", { timeout: 15000 });
  await p.getByRole("heading", { name: "Tableau de bord" }).waitFor();
  await shot(p, "admin-dashboard");
  await p.goto(B + "/admin/messages");
  await p.getByText("Test E2E").first().click();
  await p.waitForURL(/admin\/messages\//);
  await shot(p, "admin-message");
  await p.selectOption("#status", "ANSWERED");
  await p.waitForTimeout(800);
  await p.goto(B + "/admin/parametres");
  await shot(p, "admin-parametres");
  await p.fill("#company-siret", "123");
  await p.locator("form").first().getByRole("button", { name: "Enregistrer" }).click();
  await p.getByText("Le SIRET comporte 14 chiffres").waitFor({ timeout: 8000 });
  log("validation SIRET serveur: ok");
  await p.goto(B + "/admin/journal");
  await shot(p, "admin-journal");
  log("journal lignes:", await p.locator("tbody tr").count());
  await ctx.close();
}
await browser.close();
