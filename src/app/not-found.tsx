import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="contenu" className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo variant="icon" height={64} />
      <div>
        <p className="text-gc-orange text-sm font-semibold">Erreur 404</p>
        <h1 className="mt-2 text-3xl font-bold">Page introuvable</h1>
        <p className="text-muted-foreground mt-3">Cette page n&apos;existe pas ou a été déplacée.</p>
      </div>
      <Button asChild>
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </main>
  );
}
