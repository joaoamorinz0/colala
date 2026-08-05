import type { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Place } from "@/types/place";

type SupabaseBrowserClient = NonNullable<
  ReturnType<typeof createSupabaseBrowserClient>
>;

const PLACES_TABLE = "places";
const PLACES_COLUMNS = `
  id,
  name,
  description,
  city,
  neighborhood,
  address,
  price_level,
  instagram,
  phone,
  website,
  cover_image,
  gallery,
  created_at,
  category_id,
  rating,
  latitude,
  longitude,
  opening_hours,
  featured,
  work_friendly,
  pet_friendly,
  wifi,
  sunset
`;

export async function fetchPlaces(
  client: SupabaseBrowserClient,
): Promise<Place[]> {
  const { data, error, status, statusText } = await client
    .from(PLACES_TABLE)
    .select(PLACES_COLUMNS)
    .order("created_at", { ascending: false });

  console.log("[places] fetch status:", status, statusText);
  console.log("[places] fetch data:", data);

  if (error) {
    console.error("[places] fetch error:", error);
    throw error;
  }

  return (data ?? []) as Place[];
}
