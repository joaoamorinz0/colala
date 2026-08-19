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
  sunset,
  accepts_book_club,
  category:categories(id, name, icon)
`;

export type FetchPlacesClientOptions = {
  query?: string;
  categoryId?: string | null;
  subcategoryIds?: string[];
  workFriendly?: boolean;
  petFriendly?: boolean;
  wifi?: boolean;
  acceptsBookClub?: boolean;
  limit?: number;
};

export async function fetchPlaces(
  client: SupabaseBrowserClient,
  {
    query,
    categoryId,
    subcategoryIds,
    workFriendly,
    petFriendly,
    wifi,
    acceptsBookClub,
    limit,
  }: FetchPlacesClientOptions = {},
): Promise<Place[]> {
  let request = client
    .from(PLACES_TABLE)
    .select(PLACES_COLUMNS)
    .order("created_at", { ascending: false });

  if (query?.trim()) {
    const searchTerm = query.trim();
    request = request.or(
      `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`,
    );
  }

  // Subcategoria específica: filtra pela lista exata de IDs.
  // Se subcategoryIds for vazio mas categoryId existir, filtra só pela
  // categoria principal (places sem subcategoria).
  if (subcategoryIds && subcategoryIds.length > 0) {
    request = request.in("category_id", subcategoryIds);
  } else if (categoryId) {
    request = request.eq("category_id", categoryId);
  }

  if (workFriendly) {
    request = request.eq("work_friendly", true);
  }
  if (petFriendly) {
    request = request.eq("pet_friendly", true);
  }
  if (wifi) {
    request = request.eq("wifi", true);
  }
  if (acceptsBookClub) {
    request = request.eq("accepts_book_club", true);
  }

  if (limit) {
    request = request.limit(limit);
  }

  const { data, error } = await request;

  if (error) {
    console.error("[places] fetch error:", error);
    throw error;
  }

  return (data ?? []) as unknown as Place[];
}
