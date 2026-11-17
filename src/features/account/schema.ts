import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(60),
  lastName: z.string().trim().min(1, "Nom requis").max(60),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((v) => v === "" || /^[+0-9 ().-]{6,30}$/.test(v), "Numéro invalide"),
  marketingOptIn: z.boolean(),
});
