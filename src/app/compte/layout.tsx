import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton, RequireUser } from "@/components/auth/gates";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SideNav, type SideNavItem } from "@/components/layout/side-nav";

export const metadata: Metadata = {
  title: { default: "Mon compte", template: "%s | Mon compte GC3D" },
  robots: { index: false },
};

/** Seules les rubriques réellement disponibles sont listées (voir docs/ROADMAP.md). */
const ITEMS: SideNavItem[] = [
  { href: "/compte", label: "Tableau de bord", exact: true },
  { href: "/compte/profil", label: "Mon profil" },
  { href: "/compte/securite", label: "Sécurité" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="contenu" className="container-gc flex-1 py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[14rem_1fr]">
          <aside className="space-y-4">
            <SideNav items={ITEMS} label="Espace client" />
            <SignOutButton className="hidden lg:inline-flex" />
          </aside>
          <div className="min-w-0">
            <Suspense fallback={<PageSkeleton />}>
              <RequireUser returnTo="/compte">{children}</RequireUser>
            </Suspense>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
