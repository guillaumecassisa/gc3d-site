import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Badge, Card, CardContent } from "@/components/ui/card";
import { requireStaffPage } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { hasPermission } from "@/lib/permissions";
import { MESSAGE_STATUS } from "../status";
import { StatusSelect } from "./status-select";

export const metadata = { title: "Message" };

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const user = await requireStaffPage("messages:read", "/admin/messages");
  const { id } = await params;
  const message = await db.contactMessage.findUnique({ where: { id } });
  if (!message) notFound();

  return (
    <div className="grid max-w-3xl gap-6">
      <Link href="/admin/messages" className="text-muted-foreground hover:text-foreground text-sm">
        ← Messages
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{message.subject}</h1>
        <Badge variant={MESSAGE_STATUS[message.status].variant}>{MESSAGE_STATUS[message.status].label}</Badge>
      </div>
      <Card>
        <CardContent className="grid gap-4 pt-6">
          <dl className="grid gap-2 text-sm sm:grid-cols-[8rem_1fr]">
            <dt className="text-muted-foreground">De</dt>
            <dd className="font-medium">{message.name}</dd>
            <dt className="text-muted-foreground">E-mail</dt>
            <dd>
              <a href={`mailto:${message.email}`} className="underline underline-offset-4">
                {message.email}
              </a>
            </dd>
            {message.phone ? (
              <>
                <dt className="text-muted-foreground">Téléphone</dt>
                <dd>{message.phone}</dd>
              </>
            ) : null}
            <dt className="text-muted-foreground">Reçu le</dt>
            <dd>{message.createdAt.toLocaleString("fr-FR")}</dd>
          </dl>
          <p className="bg-muted rounded-lg p-4 text-sm leading-relaxed whitespace-pre-line">{message.message}</p>
        </CardContent>
      </Card>
      {hasPermission(user.role, "messages:write") ? <StatusSelect id={message.id} status={message.status} /> : null}
    </div>
  );
}
