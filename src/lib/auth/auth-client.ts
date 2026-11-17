"use client";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

/** Client d'authentification (navigateur). Aucune donnée sensible exposée. */
export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        firstName: { type: "string", required: false },
        lastName: { type: "string", required: false },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession, requestPasswordReset, resetPassword } = authClient;
