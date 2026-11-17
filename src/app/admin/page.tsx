import Link from "next/link";
import { connection } from "next/server";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReadiness } from "@/features/admin/readiness";
import { requireStaffPage } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { hasPermission } from "@/lib/permissions";
import { markAllNotificationsRead } from "@/features/admin/actions";

export const metadata = { title: "Tableau de bord" };

export default async function AdminDashboard() {
  await connection();
  const user = await requireStaffPage("dashboard:view", "/admin");
  const since = daysAgo(30);

  const [newMessages, customers30d, products, notifications, readiness] = await Promise.all([
    db.contactMessage.count({ where: { status: "NEW" } }),
    db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: since } } }),
    db.product.count({ where: { status: "ACTIVE" } }),
    db.notification.findMany({
      where: { audience: "STAFF", readAt: null },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    hasPermission(user.role, "settings:write") ? getReadiness() : Promise.resolve([]),
  ]);

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm">
          Les indicateurs de ventes, commandes et fabrication apparaîtront avec les modules correspondants.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Messages non traités" value={newMessages} href="/admin/messages" />
        <Kpi label="Nouveaux clients (30 j)" value={customers30d} />
        <Kpi label="Produits actifs" value={products} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {readiness.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Préparation de la mise en production</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3">
                {readiness.map((r) => (
                  <li key={r.label} className="flex gap-3 text-sm">
                    {r.ok ? (
                      <CheckCircle2 className="text-success mt-0.5 size-4 shrink-0" aria-label="Conforme" />
                    ) : (
                      <CircleAlert className="text-warning mt-0.5 size-4 shrink-0" aria-label="À faire" />
                    )}
                    <div>
                      <p className="font-medium">{r.label}</p>
                      {r.detail ? <p className="text-muted-foreground">{r.detail}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Notifications non lues</CardTitle>
            {notifications.length > 0 ? (
              <form action={markAllNotificationsRead}>
                <button type="submit" className="text-xs font-semibold underline-offset-4 hover:underline">
                  Tout marquer comme lu
                </button>
              </form>
            ) : null}
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune notification.</p>
            ) : (
              <ul className="divide-y">
                {notifications.map((n) => (
                  <li key={n.id} className="py-3 text-sm">
                    {n.link ? (
                      <Link href={n.link} className="font-medium hover:underline">
                        {n.title}
                      </Link>
                    ) : (
                      <p className="font-medium">{n.title}</p>
                    )}
                    {n.body ? <p className="text-muted-foreground">{n.body}</p> : null}
                    <p className="text-muted-foreground text-xs">{n.createdAt.toLocaleString("fr-FR")}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, href }: { label: string; value: number; href?: string }) {
  const content = (
    <Card className="h-full transition-shadow hover:shadow-[var(--shadow-card-hover)]">
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

/** Hors du rendu : calcul de date à l'exécution de la requête. */
function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 3600 * 1000);
}
