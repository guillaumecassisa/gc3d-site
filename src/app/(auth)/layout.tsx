import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted flex min-h-dvh flex-col">
      <header className="container-gc flex h-16 items-center">
        <Link href="/" aria-label="GC3D — accueil">
          <Logo variant="horizontal" height={36} priority />
        </Link>
      </header>
      <main id="contenu" className="flex flex-1 items-start justify-center px-4 py-8 sm:items-center">
        <div className="bg-background w-full max-w-md rounded-2xl border p-6 shadow-[var(--shadow-card)] sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
