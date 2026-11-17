import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Nouveau mot de passe", robots: { index: false } };

export default function Page() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Nouveau mot de passe</h1>
      <p className="text-muted-foreground mt-2 mb-6 text-sm">Choisissez un nouveau mot de passe pour votre compte.</p>
      <Suspense fallback={<div className="bg-muted h-64 animate-pulse rounded-lg" />}>
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
