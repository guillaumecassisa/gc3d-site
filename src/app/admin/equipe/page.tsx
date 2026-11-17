import { connection } from "next/server";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireStaffPage } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ROLE_LABELS, STAFF_ROLES } from "@/lib/permissions";
import { RoleForm } from "./role-form";

export const metadata = { title: "Utilisateurs internes" };

export default async function TeamPage() {
  await connection();
  const actor = await requireStaffPage("staff:manage", "/admin/equipe");
  const staff = await db.user.findMany({
    where: { role: { in: [...STAFF_ROLES] } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="grid max-w-4xl gap-8">
      <h1 className="text-2xl font-bold tracking-tight">Utilisateurs internes</h1>

      <div className="bg-background overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[32rem] text-sm">
          <thead className="bg-muted text-muted-foreground border-b text-left text-xs tracking-wide uppercase">
            <tr>
              <th className="px-4 py-3">Personne</th>
              <th className="px-4 py-3">Rôle</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {staff.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {u.name} {u.id === actor.id ? <span className="text-muted-foreground text-xs">(vous)</span> : null}
                  </p>
                  <p className="text-muted-foreground text-xs">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === "OWNER" ? "dark" : "neutral"}>{ROLE_LABELS[u.role]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attribuer un rôle</CardTitle>
          <CardDescription>
            La personne crée d&apos;abord un compte client, puis vous lui attribuez un rôle. Ses sessions sont fermées
            pour appliquer immédiatement les nouveaux droits. Choisir « Client » retire l&apos;accès à
            l&apos;administration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleForm roles={Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))} />
        </CardContent>
      </Card>
    </div>
  );
}
