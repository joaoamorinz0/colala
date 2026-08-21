export type EventStatus = "draft" | "published";

export type RecurrenceFrequency = "weekly" | "biweekly" | "monthly";

export type Event = {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  category_id: string | null;
  place_id: string | null;
  location_name: string | null;
  address: string | null;
  city: string | null;
  /** Data de início no formato YYYY-MM-DD (coluna `date`). */
  start_date: string;
  /** Horário no formato HH:MM:SS (coluna `time`). */
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  is_recurring: boolean | null;
  recurrence_frequency: RecurrenceFrequency | null;
  recurrence_day_of_week: number | null;
  recurrence_day_of_month: number | null;
  recurrence_end_date: string | null;
  price: number | null;
  is_free: boolean | null;
  organizer_name: string | null;
  organizer_instagram: string | null;
  instagram: string | null;
  website: string | null;
  phone: string | null;
  additional_info: string | null;
  status: EventStatus | null;
  created_at: string;
  updated_at: string | null;
  category?: {
    id: string;
    name: string;
    icon: string | null;
  } | null;
  place?: {
    id: string;
    name: string;
  } | null;
};

/** Payload usado ao criar/atualizar um evento no painel admin. */
export type EventInput = {
  name: string;
  description: string | null;
  cover_image: string | null;
  category_id: string;
  place_id: string | null;
  location_name: string | null;
  address: string | null;
  city: string | null;
  start_date: string;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  is_recurring: boolean;
  recurrence_frequency: RecurrenceFrequency | null;
  recurrence_day_of_week: number | null;
  recurrence_day_of_month: number | null;
  recurrence_end_date: string | null;
  price: number | null;
  is_free: boolean;
  organizer_name: string | null;
  organizer_instagram: string | null;
  instagram: string | null;
  website: string | null;
  phone: string | null;
  additional_info: string | null;
  status?: EventStatus;
};
