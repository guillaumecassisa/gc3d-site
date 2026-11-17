import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignUpForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Créer un compte", robots: { index: false } };

export default function Page() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Créer un compte</h1>
      <p className="text-muted-foreground mt-2 mb-6 text-sm">Suivez vos commandes et vos devis en un seul endroit.</p>
      <Suspense fallback={<div className="bg-muted h-64 animate-pulse rounded-lg" />}>
        <SignUpForm />
      </Suspense>
      <p className="mt-6 text-center text-sm">
        Déjà client ?{" "}
        <Link href="/connexion" className="font-semibold underline-offset-4 hover:underline">
          Se connecter
        </Link>
      </p>
    </>
  );
}
