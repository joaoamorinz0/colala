import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Event } from "@/types/event";

const EVENTS_TABLE = "events";

const EVENT_COLUMNS = `
  id,
  name,
  description,
  cover_image,
  category_id,
  place_id,
  location_name,
  address,
  city,
  start_date,
  start_time,
  end_date,
  end_time,
  is_recurring,
  recurrence_frequency,
  recurrence_day_of_week,
  recurrence_day_of_month,
  recurrence_end_date,
  price,
  is_free,
  organizer_name,
  organizer_instagram,
  instagram,
  website,
  phone,
  additional_info,
  status,
  created_at,
  updated_at,
  category:categories(id, name, icon),
  place:places(id, name)
`;

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export type FetchEventsOptions = {
  /** Apenas eventos com start_date >= hoje (padrão: true). */
  upcomingOnly?: boolean;
  categoryId?: string | null;
  freeOnly?: boolean;
  limit?: number;
};

/**
 * Busca eventos publicados (leitura pública via RLS).
 * Recorrentes são incluídos normalmente — a listagem usa start_date
 * como data de referência.
 */
export async function fetchEvents(
  options: FetchEventsOptions = {},
): Promise<Event[]> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return [];

  const { upcomingOnly = true, categoryId, freeOnly, limit } = options;

  let request = supabase
    .from(EVENTS_TABLE)
    .select(EVENT_COLUMNS)
    .order("start_date", { ascending: true });

  if (upcomingOnly) {
    request = request.gte("start_date", toIsoDate(new Date()));
  }

  if (categoryId) {
    request = request.eq("category_id", categoryId);
  }

  if (freeOnly) {
    request = request.eq("is_free", true);
  }

  if (limit) {
    request = request.limit(limit);
  }

  const { data, error } = await request;

  if (error) {
    console.error("[events] fetch error:", error);
    throw error;
  }

  return (data ?? []) as unknown as Event[];
}

export async function fetchEventById(id: string): Promise<Event | null> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .select(EVENT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[events] fetch by id error:", error);
    return null;
  }

  return (data as unknown as Event | null) ?? null;
}

// ─── Admin (RLS: insert/update/delete apenas admin) ──────────────────────────

export type AdminEventPayload = {
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
  recurrence_frequency: string | null;
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
  status: "draft" | "published";
};

export async function fetchAllEventsAdmin(): Promise<Event[]> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .select(EVENT_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Erro ao buscar eventos: ${error.message}`);

  return (data ?? []) as unknown as Event[];
}

export async function fetchEventByIdAdmin(id: string): Promise<Event> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(`Erro ao buscar evento: ${error.message}`);

  return data as unknown as Event;
}

export async function createEvent(payload: AdminEventPayload): Promise<Event> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar evento: ${error.message}`);

  return data as unknown as Event;
}

export async function updateEvent(
  id: string,
  payload: Partial<AdminEventPayload>,
): Promise<Event> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase não configurado");

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(`Erro ao atualizar evento: ${error.message}`);

  if (!data) {
    throw new Error(
      "Evento atualizado, mas não retornado — possível bloqueio de RLS na leitura.",
    );
  }

  return data as unknown as Event;
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase não configurado");

  const { error } = await supabase.from(EVENTS_TABLE).delete().eq("id", id);

  if (error) throw new Error(`Erro ao deletar evento: ${error.message}`);
}
