import { connection } from "next/server";
import { requireStaffPage } from "@/lib/auth/session";
import { db } from "@/lib/db/client";

export const metadata = { title: "Journal d'activité" };

const ACTION_LABELS: Record<string, string> = {
  "settings.update": "Paramètres modifiés",
  "message.status_change": "Statut de message modifié",
  "user.role_change": "Rôle modifié",
};

export default async function AuditPage() {
  await connection();
  await requireStaffPage("audit:read", "/admin/journal");
  const entries = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { name: true, email: true } } },
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Journal d&apos;activité</h1>
        <p className="text-muted-foreground text-sm">200 dernières actions sensibles de l&apos;équipe.</p>
      </div>
      {entries.length === 0 ? (
        <p className="bg-background text-muted-foreground rounded-xl border p-8 text-center text-sm">
          Aucune action enregistrée.
        </p>
      ) : (
        <div className="bg-background overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[44rem] text-sm">
            <thead className="bg-muted text-muted-foreground border-b text-left text-xs tracking-wide uppercase">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Auteur</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {entries.map((e) => (
                <tr key={e.id} className="align-top">
                  <td className="px-4 py-3 whitespace-nowrap">{e.createdAt.toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3">{e.actor?.name ?? "Système"}</td>
                  <td className="px-4 py-3">
                    {ACTION_LABELS[e.action] ?? e.action}
                    <p className="text-muted-foreground text-xs">
                      {e.entityType}
                      {e.entityId ? ` · ${e.entityId}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-muted-foreground text-xs break-all">{JSON.stringify(e.data)}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
