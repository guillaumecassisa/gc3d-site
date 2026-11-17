"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";
import { Field, Input, Textarea, describedBy } from "@/components/ui/form-controls";
import { submitContact } from "@/features/contact/actions";
import { CONTACT_SUBJECTS, contactSchema, type ContactInput, type ContactSubject } from "@/features/contact/schema";

export function ContactForm() {
  const params = useSearchParams();
  const initialSubject = (params.get("objet") ?? "autre") as ContactSubject;
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [renderedAt] = useState(() => Date.now());

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: initialSubject in CONTACT_SUBJECTS ? initialSubject : "autre",
      message: "",
      website: "",
      renderedAt,
    },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await submitContact(values);
      if (res.ok) {
        setSent(true);
        form.reset();
        return;
      }
      if (res.fieldErrors) {
        for (const [k, v] of Object.entries(res.fieldErrors)) {
          if (v?.[0]) form.setError(k as keyof ContactInput, { message: v[0] });
        }
      }
      setServerError(res.message);
    });
  });

  if (sent) {
    return (
      <Alert tone="success" className="flex items-start gap-3 p-6">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div>
          <p className="font-semibold">Message envoyé</p>
          <p className="mt-1">Merci ! Nous vous répondrons dans les meilleurs délais.</p>
        </div>
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      {serverError ? <Alert tone="error">{serverError}</Alert> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Nom" required error={errors.name?.message}>
          <Input
            id="name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("name", errors.name?.message)}
            {...form.register("name")}
          />
        </Field>
        <Field id="email" label="E-mail" required error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("email", errors.email?.message)}
            {...form.register("email")}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="phone" label="Téléphone" hint="Facultatif" error={errors.phone?.message}>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy("phone", errors.phone?.message, "Facultatif")}
            {...form.register("phone")}
          />
        </Field>
        <Field id="subject" label="Objet" required error={errors.subject?.message}>
          <select
            id="subject"
            className="border-input bg-background h-11 w-full rounded-lg border px-3 text-base sm:text-sm"
            {...form.register("subject")}
          >
            {Object.entries(CONTACT_SUBJECTS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="message" label="Message" required error={errors.message?.message}>
        <Textarea
          id="message"
          rows={6}
          aria-invalid={!!errors.message}
          aria-describedby={describedBy("message", errors.message?.message)}
          {...form.register("message")}
        />
      </Field>

      {/* Pot de miel anti-robots (masqué aux humains et aux lecteurs d'écran) */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Site web</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...form.register("website")} />
      </div>

      <div className="grid gap-2">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-5 shrink-0 accent-[var(--gc-orange)]"
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            {...form.register("consent")}
          />
          <span>
            J&apos;accepte que mes informations soient utilisées pour traiter ma demande, conformément à la{" "}
            <Link href="/legal/confidentialite" className="underline underline-offset-4">
              politique de confidentialité
            </Link>
            .
          </span>
        </label>
        {errors.consent ? (
          <p id="consent-error" role="alert" className="text-destructive text-sm">
            {errors.consent.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" variant="accent" size="lg" disabled={pending} className="sm:w-fit">
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
        Envoyer le message
      </Button>
    </form>
  );
}
