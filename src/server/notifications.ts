import "server-only";
import { db, type Tx } from "@/lib/db/client";

/** Notification interne visible par le personnel dans l'administration. */
export async function notifyStaff(
  n: { type: string; title: string; body?: string; link?: string },
  tx: Tx | typeof db = db,
) {
  await tx.notification.create({
    data: { audience: "STAFF", type: n.type, title: n.title, body: n.body, link: n.link },
  });
}

export async function notifyCustomer(
  userId: string,
  n: { type: string; title: string; body?: string; link?: string },
  tx: Tx | typeof db = db,
) {
  await tx.notification.create({
    data: { audience: "CUSTOMER", userId, type: n.type, title: n.title, body: n.body, link: n.link },
  });
}
