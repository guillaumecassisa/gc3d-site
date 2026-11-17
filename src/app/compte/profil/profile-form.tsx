"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form-controls";
import { updateProfile } from "@/features/account/actions";
import { profileSchema } from "@/features/account/schema";

type Values = z.infer<typeof profileSchema>;

export function ProfileForm({ defaults }: { defaults: Values }) {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(profileSchema), defaultValues: defaults });
  const { errors } = form.formState;

  return (
    <form
      noValidate
      className="grid gap-5"
      onSubmit={form.handleSubmit((v) =>
        start(async () => {
          const res = await updateProfile(v);
          setStatus(res.ok ? { tone: "success", text: "Profil enregistré." } : { tone: "error", text: res.message });
        }),
      )}
    >
      {status ? <Alert tone={status.tone}>{status.text}</Alert> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="firstName" label="Prénom" error={errors.firstName?.message}>
          <Input id="firstName" autoComplete="given-name" {...form.register("firstName")} />
        </Field>
        <Field id="lastName" label="Nom" error={errors.lastName?.message}>
          <Input id="lastName" autoComplete="family-name" {...form.register("lastName")} />
        </Field>
      </div>
      <Field id="phone" label="Téléphone" hint="Facultatif — utile pour la livraison" error={errors.phone?.message}>
        <Input id="phone" type="tel" autoComplete="tel" {...form.register("phone")} />
      </Field>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 size-5 accent-[var(--gc-orange)]"
          {...form.register("marketingOptIn")}
        />
        <span>Je souhaite recevoir les nouveautés GC3D par e-mail (désinscription possible à tout moment).</span>
      </label>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
        Enregistrer
      </Button>
    </form>
  );
}
