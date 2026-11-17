import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default function Page() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Connexion</h1>
      <p className="text-muted-foreground mt-2 mb-6 text-sm">Accédez à vos commandes, devis et fichiers.</p>
      <Suspense fallback={<div className="bg-muted h-64 animate-pulse rounded-lg" />}>
        <SignInForm />
      </Suspense>
      <p className="mt-6 text-center text-sm">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold underline-offset-4 hover:underline">
          Créer un compte
        </Link>
      </p>
    </>
  );
}
