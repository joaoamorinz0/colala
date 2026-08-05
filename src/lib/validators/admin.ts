import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres."),
  description: z.string().trim().max(240).optional().nullable(),
  icon: z.string().trim().max(4).optional().nullable(),
  color: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Use uma cor hex válida.")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export const placeSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  neighborhood: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
  price_level: z
    .preprocess(
      (value) => (value === "" ? null : value),
      z.number().int().min(1).max(4).nullable(),
    )
    .optional()
    .nullable(),
  instagram: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  website: z.string().trim().url().optional().nullable().or(z.literal("")),
  cover_image: z.string().trim().url().optional().nullable(),
  category_id: z.string().uuid().optional().nullable().or(z.literal("")),
  latitude: z
    .preprocess(
      (value) => (value === "" ? null : Number(value)),
      z.number().finite().nullable(),
    )
    .optional()
    .nullable(),
  longitude: z
    .preprocess(
      (value) => (value === "" ? null : Number(value)),
      z.number().finite().nullable(),
    )
    .optional()
    .nullable(),
  opening_hours: z.string().trim().optional().nullable(),
});

export const reviewSchema = z.object({
  place_id: z.string().uuid("Selecione um local válido."),
  user_id: z.string().uuid("Selecione um usuário válido."),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().nullable(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type PlaceInput = z.infer<typeof placeSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
