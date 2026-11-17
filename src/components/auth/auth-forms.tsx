"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";
import { Field, Input, describedBy } from "@/components/ui/form-controls";
import { requestPasswordReset, resetPassword, signIn, signUp } from "@/lib/auth/auth-client";
import { safeRedirectPath } from "@/lib/safe-redirect";

const password = z.string().min(10, "10 caractères minimum").max(128);

/** Messages d'erreur génériques : ne révèlent pas l'existence d'un compte. */
function authErrorMessage(code?: string, status?: number): string {
  if (status === 429) return "Trop de tentatives. Patientez quelques minutes avant de réessayer.";
  switch (code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "E-mail ou mot de passe incorrect.";
    case "EMAIL_NOT_VERIFIED":
      return "Confirmez d'abord votre adresse e-mail (lien envoyé à l'inscription).";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "Impossible de créer le compte avec cette adresse. Essayez de vous connecter.";
    case "PASSWORD_TOO_SHORT":
      return "Mot de passe trop court (10 caractères minimum).";
    case "INVALID_TOKEN":
      return "Ce lien n'est plus valide. Faites une nouvelle demande.";
    default:
      return "La demande n'a pas pu aboutir. Réessayez.";
  }
}

// ---------------------------------------------------------------------------- Connexion

const signInSchema = z.object({
  email: z.email("Adresse e-mail invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export function SignInForm() {
  const params = useSearchParams();
  const returnTo = safeRedirectPath(params.get("retour"));
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const form = useForm<z.infer<typeof signInSchema>>({ resolver: zodResolver(signInSchema) });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((v) =>
    start(async () => {
      setError(null);
      const res = await signIn.email({ email: v.email, password: v.password });
      if (res.error) return setError(authErrorMessage(res.error.code, res.error.status));
      // Rechargement complet volontaire : l'interface repart de la nouvelle session.

      window.location.assign(returnTo);
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      {error ? <Alert tone="error">{error}</Alert> : null}
      <Field id="email" label="E-mail" error={errors.email?.message}>
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
      <Field id="password" label="Mot de passe" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          aria-describedby={describedBy("password", errors.password?.message)}
          {...form.register("password")}
        />
      </Field>
      <div className="-mt-2 text-right text-sm">
        <Link href="/mot-de-passe-oublie" className="underline-offset-4 hover:underline">
          Mot de passe oublié ?
        </Link>
      </div>
      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
        Se connecter
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------- Inscription

const signUpSchema = z
  .object({
    firstName: z.string().trim().min(1, "Prénom requis").max(60),
    lastName: z.string().trim().min(1, "Nom requis").max(60),
    email: z.email("Adresse e-mail invalide"),
    password,
    confirm: z.string(),
    terms: z.literal(true, { error: "Votre accord est nécessaire" }),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Les mots de passe ne correspondent pas" });

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const form = useForm<z.infer<typeof signUpSchema>>({ resolver: zodResolver(signUpSchema) });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((v) =>
    start(async () => {
      setError(null);
      const res = await signUp.email({
        email: v.email,
        password: v.password,
        name: `${v.firstName} ${v.lastName}`,
        firstName: v.firstName,
        lastName: v.lastName,
        callbackURL: "/compte",
      });
      if (res.error) return setError(authErrorMessage(res.error.code, res.error.status));
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- rechargement après connexion
      window.location.assign("/compte?bienvenue=1");
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      {error ? <Alert tone="error">{error}</Alert> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="firstName" label="Prénom" error={errors.firstName?.message}>
          <Input
            id="firstName"
            autoComplete="given-name"
            aria-invalid={!!errors.firstName}
            {...form.register("firstName")}
          />
        </Field>
        <Field id="lastName" label="Nom" error={errors.lastName?.message}>
          <Input
            id="lastName"
            autoComplete="family-name"
            aria-invalid={!!errors.lastName}
            {...form.register("lastName")}
          />
        </Field>
      </div>
      <Field id="email" label="E-mail" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          aria-invalid={!!errors.email}
          {...form.register("email")}
        />
      </Field>
      <Field id="password" label="Mot de passe" hint="10 caractères minimum" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          aria-describedby={describedBy("password", errors.password?.message, "10 caractères minimum")}
          {...form.register("password")}
        />
      </Field>
      <Field id="confirm" label="Confirmation du mot de passe" error={errors.confirm?.message}>
        <Input
          id="confirm"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirm}
          {...form.register("confirm")}
        />
      </Field>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 size-5 shrink-0 accent-[var(--gc-orange)]"
          {...form.register("terms")}
        />
        <span>
          J&apos;ai lu la{" "}
          <Link href="/legal/confidentialite" className="underline underline-offset-4">
            politique de confidentialité
          </Link>
          .
        </span>
      </label>
      {errors.terms ? (
        <p role="alert" className="text-destructive -mt-3 text-sm">
          {errors.terms.message}
        </p>
      ) : null}
      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
        Créer mon compte
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------- Mot de passe oublié

export function ForgotPasswordForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const form = useForm<{ email: string }>({
    resolver: zodResolver(z.object({ email: z.email("Adresse e-mail invalide") })),
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((v) =>
    start(async () => {
      setError(null);
      const res = await requestPasswordReset({ email: v.email, redirectTo: "/reinitialiser-mot-de-passe" });
      if (res.error?.status === 429) return setError(authErrorMessage(undefined, 429));
      // Réponse identique que le compte existe ou non.
      setDone(true);
    }),
  );

  if (done) {
    return (
      <Alert tone="success">
        Si un compte existe pour cette adresse, un e-mail contenant un lien de réinitialisation vient d&apos;être
        envoyé. Le lien est valable 30 minutes.
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      {error ? <Alert tone="error">{error}</Alert> : null}
      <Field id="email" label="E-mail" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          aria-invalid={!!errors.email}
          {...form.register("email")}
        />
      </Field>
      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
        Recevoir le lien
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------- Réinitialisation

const resetSchema = z
  .object({ password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Les mots de passe ne correspondent pas" });

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const tokenError = params.get("error");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const form = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) });
  const { errors } = form.formState;

  if (!token || tokenError) {
    return (
      <Alert tone="error">
        Ce lien de réinitialisation est invalide ou expiré.{" "}
        <Link href="/mot-de-passe-oublie" className="font-semibold underline">
          Faire une nouvelle demande
        </Link>
      </Alert>
    );
  }

  const onSubmit = form.handleSubmit((v) =>
    start(async () => {
      setError(null);
      const res = await resetPassword({ newPassword: v.password, token });
      if (res.error) return setError(authErrorMessage(res.error.code, res.error.status));
      router.replace("/connexion?reinitialise=1");
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      {error ? <Alert tone="error">{error}</Alert> : null}
      <Field id="password" label="Nouveau mot de passe" hint="10 caractères minimum" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...form.register("password")}
        />
      </Field>
      <Field id="confirm" label="Confirmation" error={errors.confirm?.message}>
        <Input
          id="confirm"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirm}
          {...form.register("confirm")}
        />
      </Field>
      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
        Enregistrer le mot de passe
      </Button>
    </form>
  );
}
