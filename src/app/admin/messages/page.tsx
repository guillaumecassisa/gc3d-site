import Link from "next/link";
import { connection } from "next/server";
import { Badge } from "@/components/ui/card";
import { requireStaffPage } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { MESSAGE_STATUS } from "./status";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  await connection();
  await requireStaffPage("messages:read", "/admin/messages");
  const messages = await db.contactMessage.findMany({
    where: { status: { not: "SPAM" } },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, name: true, email: true, subject: true, status: true, createdAt: true },
  });

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
      {messages.length === 0 ? (
        <p className="bg-background text-muted-foreground rounded-xl border p-8 text-center text-sm">
          Aucun message reçu.
        </p>
      ) : (
        <div className="bg-background overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="bg-muted text-muted-foreground border-b text-left text-xs tracking-wide uppercase">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Expéditeur</th>
                <th className="px-4 py-3">Objet</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {messages.map((m) => (
                <tr key={m.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 whitespace-nowrap">{m.createdAt.toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/messages/${m.id}`} className="font-medium hover:underline">
                      {m.name}
                    </Link>
                    <p className="text-muted-foreground text-xs">{m.email}</p>
                  </td>
                  <td className="px-4 py-3">{m.subject}</td>
                  <td className="px-4 py-3">
                    <Badge variant={MESSAGE_STATUS[m.status].variant}>{MESSAGE_STATUS[m.status].label}</Badge>
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
