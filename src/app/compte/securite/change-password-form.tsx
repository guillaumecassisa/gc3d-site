"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form-controls";
import { authClient } from "@/lib/auth/auth-client";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z.string().min(10, "10 caractères minimum").max(128),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, { path: ["confirm"], message: "Les mots de passe ne correspondent pas" });

export function ChangePasswordForm() {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const { errors } = form.formState;

  return (
    <form
      noValidate
      className="grid gap-5"
      onSubmit={form.handleSubmit((v) =>
        start(async () => {
          const res = await authClient.changePassword({
            currentPassword: v.currentPassword,
            newPassword: v.newPassword,
            revokeOtherSessions: true,
          });
          if (res.error) {
            setStatus({
              tone: "error",
              text:
                res.error.status === 429
                  ? "Trop de tentatives, réessayez plus tard."
                  : "Mot de passe actuel incorrect.",
            });
            return;
          }
          form.reset();
          setStatus({ tone: "success", text: "Mot de passe modifié." });
        }),
      )}
    >
      {status ? <Alert tone={status.tone}>{status.text}</Alert> : null}
      <Field id="currentPassword" label="Mot de passe actuel" error={errors.currentPassword?.message}>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          {...form.register("currentPassword")}
        />
      </Field>
      <Field
        id="newPassword"
        label="Nouveau mot de passe"
        hint="10 caractères minimum"
        error={errors.newPassword?.message}
      >
        <Input id="newPassword" type="password" autoComplete="new-password" {...form.register("newPassword")} />
      </Field>
      <Field id="confirm" label="Confirmation" error={errors.confirm?.message}>
        <Input id="confirm" type="password" autoComplete="new-password" {...form.register("confirm")} />
      </Field>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
        Modifier le mot de passe
      </Button>
    </form>
  );
}
