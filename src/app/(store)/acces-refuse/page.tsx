import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Accès refusé", robots: { index: false } };

export default function AccessDenied() {
  return (
    <div className="container-gc max-w-xl py-20 text-center">
      <h1 className="text-3xl font-bold">Accès refusé</h1>
      <p className="text-muted-foreground mt-3">
        Votre compte ne dispose pas des droits nécessaires pour afficher cette page.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
}
