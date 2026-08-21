import { z } from "zod";

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use uma data válida (AAAA-MM-DD).");

const optionalDateString = dateString.nullable().optional().or(z.literal(""));

export const eventSchema = z
  .object({
    name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres."),
    description: z.string().trim().optional().nullable(),
    cover_image: z
      .string()
      .trim()
      .url()
      .optional()
      .nullable()
      .or(z.literal("")),
    category_id: z.string().uuid("Selecione uma categoria."),
    place_id: z.string().uuid().optional().nullable().or(z.literal("")),
    location_name: z.string().trim().optional().nullable(),
    address: z.string().trim().optional().nullable(),
    city: z.string().trim().optional().nullable(),
    start_date: dateString,
    start_time: z.string().trim().optional().nullable().or(z.literal("")),
    end_date: optionalDateString,
    end_time: z.string().trim().optional().nullable().or(z.literal("")),
    is_recurring: z.boolean(),
    recurrence_frequency: z
      .enum(["weekly", "biweekly", "monthly"])
      .optional()
      .nullable(),
    recurrence_day_of_week: z.coerce
      .number()
      .int()
      .min(0)
      .max(6)
      .optional()
      .nullable(),
    recurrence_day_of_month: z.coerce
      .number()
      .int()
      .min(1)
      .max(31)
      .optional()
      .nullable(),
    recurrence_end_date: optionalDateString,
    price: z.preprocess(
      (value) => (value === "" || value === null ? null : Number(value)),
      z.number().finite().min(0, "Preço não pode ser negativo.").nullable(),
    ),
    is_free: z.boolean(),
    organizer_name: z.string().trim().optional().nullable(),
    organizer_instagram: z.string().trim().optional().nullable(),
    instagram: z.string().trim().optional().nullable(),
    website: z
      .string()
      .trim()
      .url("Informe uma URL válida.")
      .optional()
      .nullable()
      .or(z.literal("")),
    phone: z.string().trim().optional().nullable(),
    additional_info: z.string().trim().optional().nullable(),
    status: z.enum(["draft", "published"]),
  })
  .refine(
    (data) =>
      Boolean(data.place_id) ||
      Boolean(data.location_name && data.location_name.trim()),
    {
      message:
        "Vincule um estabelecimento ou preencha o nome do local do evento.",
      path: ["location_name"],
    },
  )
  .refine((data) => !data.is_recurring || data.recurrence_frequency != null, {
    message: "Escolha a frequência da recorrência.",
    path: ["recurrence_frequency"],
  });

export type EventFormValues = z.infer<typeof eventSchema>;
