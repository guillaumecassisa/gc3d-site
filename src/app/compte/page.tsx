import Link from "next/link";
import { connection } from "next/server";
import { Alert, Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { db } from "@/lib/db/client";
import { requireUserPage } from "@/lib/auth/session";
import { isStaff, ROLE_LABELS } from "@/lib/permissions";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Tableau de bord" };

export default async function AccountDashboard() {
  await connection();
  const user = await requireUserPage("/compte");
  const [lastOrder, ordersInProgress, pendingQuotes] = await Promise.all([
    db.order.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { number: true, totalCents: true, currency: true, status: true, createdAt: true },
    }),
    db.order.count({
      where: {
        userId: user.id,
        status: { in: ["PAID", "IN_PREPARATION", "IN_PRODUCTION", "QUALITY_CHECK", "READY_TO_SHIP", "SHIPPED"] },
      },
    }),
    db.quote.count({ where: { userId: user.id, status: { in: ["SENT", "AWAITING_RESPONSE"] } } }),
  ]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bonjour {user.firstName ?? user.name}</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
        {isStaff(user.role) ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">Administration · {ROLE_LABELS[user.role]}</Link>
          </Button>
        ) : null}
      </div>

      {!user.emailVerified ? (
        <Alert tone="warning">
          Votre adresse e-mail n&apos;est pas encore confirmée. Ouvrez le lien reçu par e-mail pour sécuriser votre
          compte.
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Commandes en cours" value={ordersInProgress} />
        <Stat label="Devis en attente" value={pendingQuotes} />
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-medium">Dernière commande</CardTitle>
          </CardHeader>
          <CardContent>
            {lastOrder ? (
              <div className="grid gap-1">
                <p className="font-semibold">{lastOrder.number}</p>
                <p className="text-sm">{formatMoney(lastOrder.totalCents, lastOrder.currency)}</p>
                <Badge>{lastOrder.createdAt.toLocaleDateString("fr-FR")}</Badge>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Aucune commande pour le moment.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <SignOutButton className="w-fit border lg:hidden" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
