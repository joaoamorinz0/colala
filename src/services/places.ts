import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Place } from "@/types/place";

const PLACE_SELECT_COLUMNS =
  "id, name, description, city, price_level, instagram, cover_image, created_at, category_id";

type FetchPlacesOptions = {
  query?: string;
  limit?: number;
};

export async function fetchPlaces({
  query,
  limit,
}: FetchPlacesOptions = {}): Promise<Place[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    console.warn(
      "[places] Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
    return [];
  }

  let request = supabase
    .from("places")
    .select(PLACE_SELECT_COLUMNS)
    .order("created_at", { ascending: false });

  if (query?.trim()) {
    const searchTerm = query.trim();

    request = request.or(
      [
        `name.ilike.%${searchTerm}%`,
        `description.ilike.%${searchTerm}%`,
        `city.ilike.%${searchTerm}%`,
      ].join(","),
    );
  }

  if (limit) {
    request = request.limit(limit);
  }

  const { data, error, status, statusText } = await request;

  console.log("[places] fetch status:", status, statusText);
  console.log("[places] fetch data:", data);

  if (error) {
    console.error("[places] fetch error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return [];
  }

  return (data ?? []) as Place[];
}
