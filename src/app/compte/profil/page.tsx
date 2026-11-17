import { connection } from "next/server";
import { db } from "@/lib/db/client";
import { requireUserPage } from "@/lib/auth/session";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Mon profil" };

export default async function ProfilePage() {
  await connection();
  const session = await requireUserPage("/compte/profil");
  const user = await db.user.findUniqueOrThrow({
    where: { id: session.id },
    select: { firstName: true, lastName: true, phone: true, email: true, marketingOptIn: true },
  });
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold tracking-tight">Mon profil</h1>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">E-mail du compte : {user.email}</p>
      <ProfileForm
        defaults={{
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          phone: user.phone ?? "",
          marketingOptIn: user.marketingOptIn,
        }}
      />
    </div>
  );
}
