import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { PageSkeleton, RequireStaff } from "@/components/auth/gates";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s | Administration GC3D" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="bg-surface-dark px-4 py-4 text-white lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:py-6">
        <div className="mb-4 flex items-center justify-between lg:mb-8">
          <Link href="/admin" className="flex items-center gap-3" aria-label="Administration GC3D">
            <Logo variant="icon" tone="light" height={32} />
            <span className="text-sm font-semibold tracking-wide">Administration</span>
          </Link>
          <Link href="/" className="text-xs text-white/60 hover:text-white">
            Voir le site
          </Link>
        </div>
        <Suspense fallback={null}>
          <AdminNav />
        </Suspense>
      </aside>
      <main id="contenu" className="min-w-0 p-4 sm:p-6 lg:p-10">
        <Suspense fallback={<PageSkeleton />}>
          <RequireStaff permission="admin:access" returnTo="/admin">
            {children}
          </RequireStaff>
        </Suspense>
      </main>
    </div>
  );
}
