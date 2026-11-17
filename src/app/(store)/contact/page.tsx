import type { Metadata } from "next";
import { Suspense } from "react";
import { Mail, Phone, Clock, MapPin } from "lucide-react";
import { getSetting } from "@/features/settings/service";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question, un projet personnalisé ou une demande professionnelle ? Écrivez à GC3D.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const company = await getSetting("company");
  const address = company.showAddressPublicly
    ? [company.addressLine1, company.addressLine2, [company.postalCode, company.city].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", ")
    : null;
  // N'afficher que des coordonnées réellement configurées.
  const infos = [
    company.publicEmail && { icon: Mail, label: company.publicEmail, href: `mailto:${company.publicEmail}` },
    company.publicPhone && {
      icon: Phone,
      label: company.publicPhone,
      href: `tel:${company.publicPhone.replace(/\s/g, "")}`,
    },
    company.openingHours && { icon: Clock, label: company.openingHours },
    address && { icon: MapPin, label: address },
  ].filter(Boolean) as { icon: typeof Mail; label: string; href?: string }[];

  return (
    <div className="container-gc grid gap-12 py-12 sm:py-16 lg:grid-cols-[1fr_20rem]">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact</h1>
        <p className="text-muted-foreground mt-3">
          Une question, un projet personnalisé ou une demande professionnelle : décrivez votre besoin, nous vous
          répondons rapidement.
        </p>
        <div className="mt-8">
          <Suspense fallback={<div className="bg-muted h-96 animate-pulse rounded-xl" />}>
            <ContactForm />
          </Suspense>
        </div>
      </div>
      {infos.length > 0 ? (
        <aside className="bg-muted h-fit rounded-xl p-6">
          <h2 className="font-semibold">Coordonnées</h2>
          <ul className="mt-4 grid gap-3 text-sm">
            {infos.map(({ icon: Icon, label, href }) => (
              <li key={label} className="flex items-start gap-3">
                <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
                {href ? (
                  <a href={href} className="hover:underline">
                    {label}
                  </a>
                ) : (
                  <span>{label}</span>
                )}
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </div>
  );
}
