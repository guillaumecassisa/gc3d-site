import { z } from "zod";

export const CONTACT_SUBJECTS = {
  projet: "Projet personnalisé / devis",
  professionnel: "Demande professionnelle",
  commande: "Question sur une commande",
  autre: "Autre demande",
} as const;

export type ContactSubject = keyof typeof CONTACT_SUBJECTS;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom").max(120),
  email: z.email("Adresse e-mail invalide").max(200),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((v) => v === "" || /^[+0-9 ().-]{6,30}$/.test(v), "Numéro invalide")
    .optional()
    .default(""),
  subject: z.enum(Object.keys(CONTACT_SUBJECTS) as [ContactSubject, ...ContactSubject[]]),
  message: z.string().trim().min(10, "Votre message est trop court").max(5000),
  consent: z.literal(true, { error: "Votre accord est nécessaire pour traiter la demande" }),
  /** Pot de miel : doit rester vide (invisible pour les humains). */
  website: z.string().max(0).optional().default(""),
  /** Horodatage d'affichage du formulaire : un envoi en moins de 3 s est suspect. */
  renderedAt: z.number().int().positive(),
});

export type ContactInput = z.input<typeof contactSchema>;
