import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Mot de passe oublié", robots: { index: false } };

export default function Page() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Mot de passe oublié</h1>
      <p className="text-muted-foreground mt-2 mb-6 text-sm">Indiquez l&apos;adresse e-mail de votre compte.</p>
      <Suspense fallback={<div className="bg-muted h-64 animate-pulse rounded-lg" />}>
        <ForgotPasswordForm />
      </Suspense>
      <p className="mt-6 text-center text-sm">
        <Link href="/connexion" className="underline-offset-4 hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </>
  );
}
