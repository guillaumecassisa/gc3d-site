"use server";

import { revalidatePath } from "next/cache";
import { profileSchema } from "./schema";
import { db } from "@/lib/db/client";
import { requireUser } from "@/lib/auth/session";
import { runAction, type ActionResult } from "@/lib/errors";

/** Mise à jour du profil : l'identité vient toujours de la session serveur. */
export async function updateProfile(input: unknown): Promise<ActionResult> {
  return runAction(async () => {
    const user = await requireUser();
    const data = profileSchema.parse(input);
    await db.user.update({
      where: { id: user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        phone: data.phone || null,
        marketingOptIn: data.marketingOptIn,
      },
    });
    revalidatePath("/compte", "layout");
  });
}
