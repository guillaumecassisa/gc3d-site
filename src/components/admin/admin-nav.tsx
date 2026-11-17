import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission, ROLE_LABELS, type Permission } from "@/lib/permissions";
import { SideNav, type SideNavItem } from "@/components/layout/side-nav";

/** Modules livrés uniquement ; chaque entrée est filtrée par permission. */
const ITEMS: (SideNavItem & { permission: Permission })[] = [
  { href: "/admin", label: "Tableau de bord", exact: true, permission: "dashboard:view" },
  { href: "/admin/messages", label: "Messages", permission: "messages:read" },
  { href: "/admin/parametres", label: "Paramètres", permission: "settings:write" },
  { href: "/admin/equipe", label: "Utilisateurs internes", permission: "staff:manage" },
  { href: "/admin/journal", label: "Journal d'activité", permission: "audit:read" },
];

export async function AdminNav() {
  const user = await getCurrentUser();
  if (!user) return null;
  const items = ITEMS.filter((i) => hasPermission(user.role, i.permission));
  return (
    <div className="space-y-6">
      <SideNav items={items} label="Administration" tone="dark" />
      <div className="hidden rounded-lg bg-white/5 p-3 text-xs text-white/70 lg:block">
        <p className="truncate font-medium text-white">{user.name}</p>
        <p>{ROLE_LABELS[user.role]}</p>
      </div>
    </div>
  );
}
