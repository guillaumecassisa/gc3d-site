import { connection } from "next/server";
import { Alert, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireStaffPage } from "@/lib/auth/session";
import { getSetting, missingLegalFields } from "@/features/settings/service";
import { SettingsForm, type SettingField } from "./settings-form";

export const metadata = { title: "Paramètres" };

const COMPANY_FIELDS: SettingField[] = [
  { name: "tradeName", label: "Nom commercial", required: true },
  { name: "legalName", label: "Nom et prénom de l'entrepreneur", hint: "Obligatoire pour un entrepreneur individuel" },
  { name: "legalForm", label: "Forme juridique" },
  { name: "siret", label: "SIRET", hint: "14 chiffres" },
  { name: "apeCode", label: "Code APE" },
  { name: "vatNumber", label: "N° de TVA intracommunautaire", hint: "Laisser vide en franchise de TVA" },
  { name: "addressLine1", label: "Adresse" },
  { name: "addressLine2", label: "Complément d'adresse" },
  { name: "postalCode", label: "Code postal" },
  { name: "city", label: "Ville" },
  { name: "publicEmail", label: "E-mail de contact public", type: "email" },
  { name: "publicPhone", label: "Téléphone public" },
  { name: "openingHours", label: "Horaires", hint: "Affichés uniquement s'ils sont renseignés" },
  { name: "publicationDirector", label: "Directeur de la publication" },
  { name: "hostName", label: "Hébergeur du site" },
  { name: "hostAddress", label: "Adresse de l'hébergeur" },
  {
    name: "mediatorName",
    label: "Médiateur de la consommation",
    hint: "Adhésion obligatoire pour vendre aux particuliers",
  },
  { name: "mediatorUrl", label: "Site du médiateur", type: "url" },
  {
    name: "showAddressPublicly",
    label: "Afficher l'adresse sur le site (pied de page, contact)",
    type: "checkbox",
    hint: "Laisser décoché si l'adresse est personnelle : elle reste utilisée sur les documents légaux.",
  },
];

const BRANDING_FIELDS: SettingField[] = [
  { name: "slogan", label: "Slogan officiel", required: true },
  { name: "tagline", label: "Accroche commerciale", required: true },
  { name: "heroTitle", label: "Titre de la page d'accueil", required: true },
  { name: "heroDescription", label: "Description de la page d'accueil", type: "textarea", required: true },
  { name: "footerDescription", label: "Présentation (pied de page)", type: "textarea" },
];

const SOCIAL_FIELDS: SettingField[] = ["instagram", "facebook", "tiktok", "linkedin", "pinterest", "etsy"].map(
  (name) => ({
    name,
    label: name.charAt(0).toUpperCase() + name.slice(1),
    type: "url",
    hint: "URL complète (https://…) — laisser vide pour masquer",
  }),
);

export default async function SettingsPage() {
  await connection();
  await requireStaffPage("settings:write", "/admin/parametres");
  const [company, branding, social] = await Promise.all([
    getSetting("company"),
    getSetting("branding"),
    getSetting("social"),
  ]);
  const missing = missingLegalFields(company);

  return (
    <div className="grid max-w-4xl gap-8">
      <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>

      <Card>
        <CardHeader>
          <CardTitle>Entreprise et informations légales</CardTitle>
          <CardDescription>
            Utilisées pour les mentions légales, les devis, les factures et la page contact.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          {missing.length > 0 ? (
            <Alert tone="warning">À compléter avant l&apos;ouverture : {missing.join(", ")}.</Alert>
          ) : null}
          <SettingsForm settingKey="company" fields={COMPANY_FIELDS} values={company} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identité et accroches</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm settingKey="branding" fields={BRANDING_FIELDS} values={branding} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Réseaux sociaux</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm settingKey="social" fields={SOCIAL_FIELDS} values={social} />
        </CardContent>
      </Card>
    </div>
  );
}
