import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db/client";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email/send";

/**
 * Authentification (Better Auth) : sessions en base, cookies HttpOnly/Secure/
 * SameSite=Lax, mots de passe hachés (scrypt), limitation des tentatives
 * persistée en base, vérification d'e-mail et réinitialisation sécurisée.
 */
export const auth = betterAuth({
  appName: "GC3D",
  baseURL: env.APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
    cookiePrefix: "gc3d",
    database: { generateId: false },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 jours
    updateAge: 60 * 60 * 24, // renouvellement quotidien
    // Pas de cache de session dans le cookie : une révocation ou un changement
    // de rôle s'applique immédiatement à la requête suivante.
    cookieCache: { enabled: false },
  },
  rateLimit: {
    enabled: env.NODE_ENV !== "test",
    storage: "database",
    modelName: "rateLimit",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 300, max: 3 },
      "/send-verification-email": { window: 300, max: 3 },
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", input: false, defaultValue: "CUSTOMER" },
      firstName: { type: "string", required: false },
      lastName: { type: "string", required: false },
      phone: { type: "string", required: false, input: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 30,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        template: "password-reset",
        subject: "Réinitialisation de votre mot de passe",
        blocks: [
          { type: "paragraph", text: "Vous avez demandé à réinitialiser le mot de passe de votre compte GC3D." },
          { type: "button", label: "Choisir un nouveau mot de passe", href: url },
          {
            type: "small",
            text: "Ce lien est valable 30 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.",
          },
        ],
        related: { type: "user", id: user.id },
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        template: "email-verification",
        subject: "Confirmez votre adresse e-mail",
        blocks: [
          {
            type: "paragraph",
            text: `Bienvenue chez GC3D${user.name ? `, ${user.name}` : ""} ! Confirmez votre adresse pour sécuriser votre compte.`,
          },
          { type: "button", label: "Confirmer mon adresse", href: url },
          { type: "small", text: "Ce lien est valable 24 heures." },
        ],
        related: { type: "user", id: user.id },
      });
    },
  },
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
