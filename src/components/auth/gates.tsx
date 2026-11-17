import { requireStaffPage, requireUserPage } from "@/lib/auth/session";
import type { Permission } from "@/lib/permissions";

/**
 * Barrières d'accès serveur. À placer dans un <Suspense> : elles lisent la
 * session de la requête (non prérendable). Le contenu n'est rendu qu'après
 * vérification ; chaque page et action revérifie ses propres droits.
 */
export async function RequireUser({ returnTo, children }: { returnTo: string; children: React.ReactNode }) {
  await requireUserPage(returnTo);
  return <>{children}</>;
}

export async function RequireStaff({
  permission,
  returnTo,
  children,
}: {
  permission: Permission;
  returnTo: string;
  children: React.ReactNode;
}) {
  await requireStaffPage(permission, returnTo);
  return <>{children}</>;
}

export function PageSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Chargement">
      <div className="bg-muted h-8 w-56 animate-pulse rounded-md" />
      <div className="bg-muted h-32 animate-pulse rounded-xl" />
      <div className="bg-muted h-32 animate-pulse rounded-xl" />
    </div>
  );
}
