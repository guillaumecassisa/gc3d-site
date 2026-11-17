import { ChangePasswordForm } from "./change-password-form";

export const metadata = { title: "Sécurité" };

export default function SecurityPage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold tracking-tight">Sécurité</h1>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">
        Modifier votre mot de passe déconnecte vos autres appareils.
      </p>
      <ChangePasswordForm />
    </div>
  );
}
